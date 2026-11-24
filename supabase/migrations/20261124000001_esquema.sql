-- Monthly | para despachos · esquema base (fase 1)
-- Tablas, funciones de apoyo y datos iniciales. Las políticas RLS están en la siguiente migración.

-- ───────────────────────── Tablas ─────────────────────────

create table public.despachos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  sitio text not null default '',
  firma text not null default '',
  corto text not null default '',
  logo_url text,
  logo_provisional boolean not null default true,
  color text not null default '#393939' check (color ~* '^#[0-9a-f]{6}$'),
  color_nota text not null default '',
  precio integer,
  confirmo_contactos boolean not null default false,
  confirmo_en timestamptz,
  creado timestamptz not null default now()
);
create unique index despachos_email_unico on public.despachos (lower(email));

create table public.perfiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  rol text not null check (rol in ('admin', 'despacho')),
  despacho_id uuid references public.despachos (id) on delete set null,
  creado timestamptz not null default now()
);

-- Refresh tokens cifrados (AES-GCM en las Edge Functions). Solo los lee el service role.
create table public.tokens_correo (
  despacho_id uuid primary key references public.despachos (id) on delete cascade,
  proveedor text not null check (proveedor in ('gmail', 'outlook')),
  email text not null,
  refresh_token text not null,
  estado text not null default 'conectado' check (estado in ('conectado', 'error')),
  error text,
  actualizado timestamptz not null default now()
);

-- Una campaña por despacho en la v1.
create table public.campanas (
  despacho_id uuid primary key references public.despachos (id) on delete cascade,
  estado text not null default 'sin' check (estado in ('sin', 'activa', 'pausada', 'terminada')),
  inicio date,
  actualizado timestamptz not null default now()
);

create table public.contactos (
  id uuid primary key default gen_random_uuid(),
  despacho_id uuid not null references public.despachos (id) on delete cascade,
  empresa text not null,
  nombre text not null default '',
  correo text not null,
  tel text not null default '',
  paso smallint not null default 0 check (paso between 0 and 3),
  estatus text not null default 'Pendiente'
    check (estatus in ('Pendiente', 'Enviado', 'Abierto', 'Respondió', 'Confirmado', 'Perdido', 'Rebotado')),
  estatus_previo text,
  abrio boolean not null default false,
  hizo_click boolean not null default false,
  pausado boolean not null default false,
  inicio date,          -- fecha en que salió el correo 1
  ultimo date,          -- fecha del último evento
  ultimo_envio date,    -- fecha del último correo enviado
  respondio_en timestamptz,
  atendido_monthly boolean not null default false,
  creado timestamptz not null default now()
);
-- correo siempre se guarda en minúsculas (trigger preparar_contacto), así el único sirve para upsert.
alter table public.contactos add constraint contactos_despacho_correo unique (despacho_id, correo);
create index contactos_estatus on public.contactos (estatus);

-- Un registro por correo enviado. El único (contacto_id, paso) hace idempotente al motor.
create table public.envios (
  id uuid primary key default gen_random_uuid(),
  contacto_id uuid not null references public.contactos (id) on delete cascade,
  despacho_id uuid not null references public.despachos (id) on delete cascade,
  paso smallint not null check (paso between 1 and 3),
  fecha date not null,
  enviado_en timestamptz not null default now(),
  message_id text,
  thread_id text,
  error text,
  unique (contacto_id, paso)
);
create index envios_despacho_fecha on public.envios (despacho_id, fecha);

-- Historial del contacto.
create table public.eventos (
  id bigint generated always as identity primary key,
  contacto_id uuid not null references public.contactos (id) on delete cascade,
  despacho_id uuid not null references public.despachos (id) on delete cascade,
  fecha timestamptz not null default now(),
  tipo text not null,
  texto text not null,
  actor text not null check (actor in ('sistema', 'despacho', 'monthly'))
);
create index eventos_contacto on public.eventos (contacto_id, fecha);

-- Override de las plantillas base (n = 1, 2, 3). Sin fila se usa la base del código.
create table public.plantillas (
  n smallint primary key check (n between 1 and 3),
  asunto text not null,
  pre text not null,
  html text not null,
  editado_por uuid references auth.users (id) on delete set null,
  editado_en timestamptz not null default now()
);

create table public.config (
  id boolean primary key default true check (id),
  minimo integer not null default 3500 check (minimo > 0),
  precio_sugerido integer not null default 4500,
  precio_original integer not null default 6000,
  anio text not null default '2027',
  frase_temporada text not null default 'Para este inicio de 2027',
  notif text not null default 'alianzas@monthly.la',
  check (precio_sugerido >= minimo)
);
insert into public.config (id) values (true);

-- Aplica a todos los despachos.
create table public.supresiones (
  correo text primary key check (correo = lower(correo)),
  fecha timestamptz not null default now(),
  origen text not null default 'enlace'
);

create table public.festivos (
  fecha date primary key,
  nombre text not null
);
insert into public.festivos (fecha, nombre) values
  ('2026-01-01', 'Año Nuevo'), ('2026-02-02', 'Día de la Constitución'), ('2026-03-16', 'Natalicio de Benito Juárez'),
  ('2026-05-01', 'Día del Trabajo'), ('2026-09-16', 'Día de la Independencia'), ('2026-11-16', 'Día de la Revolución'),
  ('2026-12-25', 'Navidad'),
  ('2027-01-01', 'Año Nuevo'), ('2027-02-01', 'Día de la Constitución'), ('2027-03-15', 'Natalicio de Benito Juárez'),
  ('2027-05-01', 'Día del Trabajo'), ('2027-09-16', 'Día de la Independencia'), ('2027-11-15', 'Día de la Revolución'),
  ('2027-12-25', 'Navidad'),
  ('2028-01-01', 'Año Nuevo'), ('2028-02-07', 'Día de la Constitución'), ('2028-03-20', 'Natalicio de Benito Juárez'),
  ('2028-05-01', 'Día del Trabajo'), ('2028-09-16', 'Día de la Independencia'), ('2028-11-20', 'Día de la Revolución'),
  ('2028-12-25', 'Navidad');

-- ───────────────────────── Funciones de apoyo ─────────────────────────

create or replace function public.hoy_mx() returns date
language sql stable as $$ select (now() at time zone 'America/Mexico_City')::date $$;

create or replace function public.es_habil(d date) returns boolean
language sql stable as $$
  select extract(isodow from d) < 6 and not exists (select 1 from public.festivos f where f.fecha = d)
$$;

create or replace function public.siguiente_habil(d date) returns date
language plpgsql stable as $$
declare x date := d;
begin
  for i in 1..30 loop
    exit when public.es_habil(x);
    x := x + 1;
  end loop;
  return x;
end $$;

-- ¿La llamada viene del service role (Edge Functions) o de una migración?
create or replace function public.es_servicio() returns boolean
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') = 'service_role'
      or current_user in ('postgres', 'supabase_admin', 'service_role')
$$;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles p where p.user_id = auth.uid() and p.rol = 'admin')
$$;

create or replace function public.mi_despacho() returns uuid
language sql stable security definer set search_path = public as $$
  select p.despacho_id from public.perfiles p where p.user_id = auth.uid() and p.rol = 'despacho'
$$;

-- ───────────────────────── Triggers ─────────────────────────

-- Al crear un usuario: @monthly.la es admin; un correo con despacho invitado es despacho; otro, sin perfil.
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare d uuid;
begin
  if lower(new.email) like '%@monthly.la' then
    insert into public.perfiles (user_id, email, rol) values (new.id, lower(new.email), 'admin')
    on conflict (user_id) do nothing;
  else
    select id into d from public.despachos where lower(email) = lower(new.email);
    if d is not null then
      insert into public.perfiles (user_id, email, rol, despacho_id) values (new.id, lower(new.email), 'despacho', d)
      on conflict (user_id) do update set despacho_id = excluded.despacho_id, rol = 'despacho';
    end if;
  end if;
  return new;
end $$;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();

-- Al crear un despacho se crea su campaña.
create or replace function public.crear_campana() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.campanas (despacho_id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger al_crear_despacho after insert on public.despachos
  for each row execute function public.crear_campana();

-- Precio mínimo validado en la base y campos que el despacho no puede cambiar.
-- Ojo: sin security definer, para que es_servicio() vea el rol real de quien llama.
create or replace function public.validar_despacho() returns trigger
language plpgsql set search_path = public as $$
declare m integer;
begin
  select minimo into m from public.config;  -- config es legible para cualquier usuario con sesión
  if new.precio is not null and new.precio < m then
    raise exception 'El precio mínimo es % + IVA al mes.', m using errcode = 'check_violation';
  end if;
  if tg_op = 'UPDATE' and not public.es_servicio() then
    new.id := old.id;
    new.email := old.email;
    new.creado := old.creado;
  end if;
  new.color := upper(new.color);
  if new.confirmo_contactos and (tg_op = 'INSERT' or not old.confirmo_contactos) then
    new.confirmo_en := now();
  end if;
  return new;
end $$;
create trigger validar_despacho before insert or update on public.despachos
  for each row execute function public.validar_despacho();

-- Un contacto nuevo siempre empieza limpio, aunque el cliente mande otra cosa.
create or replace function public.esta_suprimido(p_correo text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.supresiones s where s.correo = lower(trim(p_correo)))
$$;

create or replace function public.preparar_contacto() returns trigger
language plpgsql set search_path = public as $$
begin
  new.correo := lower(trim(new.correo));
  new.empresa := trim(new.empresa);
  new.nombre := trim(coalesce(new.nombre, ''));
  if not public.es_servicio() then
    new.paso := 0; new.estatus := 'Pendiente'; new.estatus_previo := null;
    new.abrio := false; new.hizo_click := false; new.inicio := null; new.ultimo := null;
    new.ultimo_envio := null; new.respondio_en := null; new.atendido_monthly := false;
    new.pausado := public.esta_suprimido(new.correo);
  end if;
  return new;
end $$;
create trigger preparar_contacto before insert on public.contactos
  for each row execute function public.preparar_contacto();

-- ───────────────────────── Vistas ─────────────────────────

create view public.stats_despacho with (security_invoker = true) as
select
  d.id as despacho_id,
  count(c.id)::int as total,
  count(c.id) filter (where c.paso > 0)::int as enviados,
  count(c.id) filter (where c.abrio)::int as abiertos,
  count(c.id) filter (where c.hizo_click)::int as clicks,
  count(c.id) filter (where c.estatus in ('Respondió', 'Confirmado', 'Perdido'))::int as respondieron,
  count(c.id) filter (where c.estatus = 'Confirmado')::int as confirmados,
  count(c.id) filter (where c.estatus = 'Perdido')::int as perdidos
from public.despachos d
left join public.contactos c on c.despacho_id = d.id
group by d.id;
