-- Monthly | para despachos · permisos (RLS) y acciones del tablero
-- Regla general: el despacho lee y escribe solo lo suyo; Monthly (admin) lee todo.
-- Los cambios de estatus van por funciones (RPC) para que no se puedan saltar las reglas.

alter table public.despachos enable row level security;
alter table public.perfiles enable row level security;
alter table public.tokens_correo enable row level security;  -- sin políticas: solo service role
alter table public.campanas enable row level security;
alter table public.contactos enable row level security;
alter table public.envios enable row level security;
alter table public.eventos enable row level security;
alter table public.plantillas enable row level security;
alter table public.config enable row level security;
alter table public.supresiones enable row level security;
alter table public.festivos enable row level security;

-- perfiles
create policy "perfil propio" on public.perfiles for select using (user_id = auth.uid() or public.es_admin());

-- despachos
create policy "leer despacho" on public.despachos for select using (id = public.mi_despacho() or public.es_admin());
create policy "editar mi despacho" on public.despachos for update
  using (id = public.mi_despacho()) with check (id = public.mi_despacho());

-- campañas: lectura; los cambios van por programar_campana / pausar_campana
create policy "leer campaña" on public.campanas for select using (despacho_id = public.mi_despacho() or public.es_admin());

-- contactos: lectura e importación; los cambios van por accion_contacto / marcar_atendido
create policy "leer contactos" on public.contactos for select using (despacho_id = public.mi_despacho() or public.es_admin());
create policy "importar contactos" on public.contactos for insert with check (despacho_id = public.mi_despacho());

create policy "leer envíos" on public.envios for select using (despacho_id = public.mi_despacho() or public.es_admin());
create policy "leer eventos" on public.eventos for select using (despacho_id = public.mi_despacho() or public.es_admin());

-- plantillas, config y festivos: todos leen, solo Monthly escribe
create policy "leer plantillas" on public.plantillas for select to authenticated using (true);
create policy "editar plantillas" on public.plantillas for all using (public.es_admin()) with check (public.es_admin());
create policy "leer config" on public.config for select to authenticated using (true);
create policy "editar config" on public.config for update using (public.es_admin()) with check (public.es_admin());
create policy "leer festivos" on public.festivos for select to authenticated using (true);
create policy "editar festivos" on public.festivos for all using (public.es_admin()) with check (public.es_admin());

-- supresiones: solo Monthly las ve completas; el despacho pregunta con correos_suprimidos()
create policy "leer bajas" on public.supresiones for select using (public.es_admin());
create policy "editar bajas" on public.supresiones for all using (public.es_admin()) with check (public.es_admin());

-- ───────────────────────── Acciones (RPC) ─────────────────────────

-- De una lista de correos, cuáles se dieron de baja (para validar el Excel sin exponer la lista).
create or replace function public.correos_suprimidos(p_correos text[]) returns setof text
language sql stable security definer set search_path = public as $$
  select s.correo from public.supresiones s where s.correo = any (select lower(trim(x)) from unnest(p_correos) x)
$$;

-- Estado del buzón conectado, sin exponer el token.
create or replace function public.estado_correo(p_despacho uuid default null)
returns table (proveedor text, email text, estado text, error text)
language sql stable security definer set search_path = public as $$
  select t.proveedor, t.email, t.estado, t.error
  from public.tokens_correo t
  where t.despacho_id = coalesce(p_despacho, public.mi_despacho())
    and (t.despacho_id = public.mi_despacho() or public.es_admin())
$$;

create or replace function public.registrar_evento(p_contacto uuid, p_despacho uuid, p_tipo text, p_texto text, p_actor text)
returns void language sql security definer set search_path = public as $$
  insert into public.eventos (contacto_id, despacho_id, tipo, texto, actor) values (p_contacto, p_despacho, p_tipo, p_texto, p_actor);
  update public.contactos set ultimo = public.hoy_mx() where id = p_contacto;
$$;
revoke execute on function public.registrar_evento(uuid, uuid, text, text, text) from public, anon, authenticated;

-- Programar la campaña: valida que el alta esté completa y arranca el siguiente día hábil.
create or replace function public.programar_campana() returns date
language plpgsql security definer set search_path = public as $$
declare
  d public.despachos;
  falta text[] := '{}';
  ini date;
begin
  select * into d from public.despachos where id = public.mi_despacho();
  if d.id is null then raise exception 'No tienes un despacho asignado.'; end if;
  if d.nombre = '' or d.sitio = '' or d.firma = '' then falta := array_append(falta, 'completar tu perfil'); end if;
  if not exists (select 1 from public.tokens_correo t where t.despacho_id = d.id and t.estado = 'conectado') then
    falta := array_append(falta, 'conectar tu correo');
  end if;
  if not exists (select 1 from public.contactos c where c.despacho_id = d.id) then falta := array_append(falta, 'cargar contactos'); end if;
  if not d.confirmo_contactos then falta := array_append(falta, 'confirmar la vista previa'); end if;
  if array_length(falta, 1) > 0 then
    raise exception 'Te falta %.', array_to_string(falta, ', ');
  end if;
  ini := public.siguiente_habil(public.hoy_mx() + 1);
  update public.campanas set estado = 'activa', inicio = ini, actualizado = now()
   where despacho_id = d.id and estado = 'sin';
  if not found then raise exception 'La campaña ya estaba programada.'; end if;
  return ini;
end $$;

-- Pausar o reanudar la campaña completa. El despacho la suya; Monthly cualquiera.
create or replace function public.pausar_campana(p_despacho uuid default null) returns text
language plpgsql security definer set search_path = public as $$
declare id_ uuid := coalesce(p_despacho, public.mi_despacho()); e text;
begin
  if not (id_ = public.mi_despacho() or public.es_admin()) then raise exception 'Sin permiso.'; end if;
  update public.campanas
     set estado = case estado when 'activa' then 'pausada' when 'pausada' then 'activa' else estado end,
         actualizado = now()
   where despacho_id = id_
   returning estado into e;
  if e not in ('activa', 'pausada') then raise exception 'La campaña no está programada.'; end if;
  return e;
end $$;

-- Acciones manuales del despacho sobre un contacto.
-- p_accion: respondio | confirmado | perdido | reabrir | pausar | reanudar
create or replace function public.accion_contacto(p_contacto uuid, p_accion text) returns public.contactos
language plpgsql security definer set search_path = public as $$
declare c public.contactos; detenido boolean;
begin
  select * into c from public.contactos where id = p_contacto for update;
  if c.id is null or c.despacho_id is distinct from public.mi_despacho() then
    raise exception 'No encontramos ese contacto en tu despacho.';
  end if;
  detenido := c.estatus in ('Respondió', 'Confirmado', 'Perdido', 'Rebotado');

  if p_accion = 'respondio' then
    if detenido then raise exception 'Este contacto ya no está en la secuencia.'; end if;
    update public.contactos set estatus_previo = estatus, estatus = 'Respondió', respondio_en = now(),
           atendido_monthly = false where id = c.id;
    perform public.registrar_evento(c.id, c.despacho_id, 'respondio', 'Marcado como respondió por el despacho', 'despacho');
  elsif p_accion in ('confirmado', 'perdido') then
    if c.estatus <> 'Respondió' then raise exception 'Solo se puede cerrar un contacto que respondió.'; end if;
    update public.contactos set estatus_previo = 'Respondió',
           estatus = case p_accion when 'confirmado' then 'Confirmado' else 'Perdido' end
     where id = c.id;
    perform public.registrar_evento(c.id, c.despacho_id, p_accion,
      case p_accion when 'confirmado' then 'Confirmado: activó su mes gratis' else 'Marcado como perdido' end, 'despacho');
  elsif p_accion = 'reabrir' then
    if c.estatus not in ('Confirmado', 'Perdido') then raise exception 'Solo se reabre un contacto confirmado o perdido.'; end if;
    update public.contactos set estatus = 'Respondió', estatus_previo = c.estatus where id = c.id;
    perform public.registrar_evento(c.id, c.despacho_id, 'reabrir', 'Se deshizo el cierre', 'despacho');
  elsif p_accion in ('pausar', 'reanudar') then
    if detenido or c.paso >= 3 then raise exception 'Este contacto ya no recibe correos.'; end if;
    if public.esta_suprimido(c.correo) and p_accion = 'reanudar' then raise exception 'Este correo se dio de baja.'; end if;
    update public.contactos set pausado = (p_accion = 'pausar') where id = c.id;
    perform public.registrar_evento(c.id, c.despacho_id, p_accion,
      case p_accion when 'pausar' then 'Contacto en pausa' else 'Contacto reanudado' end, 'despacho');
  else
    raise exception 'Acción desconocida: %', p_accion;
  end if;

  select * into c from public.contactos where id = p_contacto;
  return c;
end $$;

-- Monthly marca o desmarca una respuesta como atendida.
create or replace function public.marcar_atendido(p_contacto uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare v boolean;
begin
  if not public.es_admin() then raise exception 'Sin permiso.'; end if;
  update public.contactos set atendido_monthly = not atendido_monthly where id = p_contacto returning atendido_monthly into v;
  return v;
end $$;

-- Panel Monthly: un renglón por despacho con avance del alta y resultados.
create or replace function public.resumen_despachos()
returns table (
  id uuid, nombre text, email text, logo_url text, color text, precio integer,
  perfil_ok boolean, correo_ok boolean, campana text, inicio date,
  total int, enviados int, abiertos int, respondieron int, confirmados int, sin_atender int
)
language sql stable security definer set search_path = public as $$
  select d.id, d.nombre, d.email, d.logo_url, d.color, d.precio,
         (d.nombre <> '' and d.sitio <> '' and d.firma <> ''),
         exists (select 1 from public.tokens_correo t where t.despacho_id = d.id and t.estado = 'conectado'),
         coalesce(c.estado, 'sin'), c.inicio,
         s.total, s.enviados, s.abiertos, s.respondieron, s.confirmados,
         (select count(*)::int from public.contactos x where x.despacho_id = d.id and x.estatus = 'Respondió' and not x.atendido_monthly)
  from public.despachos d
  left join public.campanas c on c.despacho_id = d.id
  left join public.stats_despacho s on s.despacho_id = d.id
  where public.es_admin()
  order by d.creado
$$;

grant execute on function public.correos_suprimidos(text[]) to authenticated;
grant execute on function public.estado_correo(uuid) to authenticated;
grant execute on function public.programar_campana() to authenticated;
grant execute on function public.pausar_campana(uuid) to authenticated;
grant execute on function public.accion_contacto(uuid, text) to authenticated;
grant execute on function public.marcar_atendido(uuid) to authenticated;
grant execute on function public.resumen_despachos() to authenticated;
