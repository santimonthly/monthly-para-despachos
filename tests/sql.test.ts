// Prueba las migraciones (tablas, RLS, triggers y RPC) en un Postgres embebido (PGlite),
// con un esquema auth mínimo que imita al de Supabase. Storage y cron no se prueban aquí.
import { beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();
const mig = (f: string) => readFileSync(`supabase/migrations/${f}`, "utf8");

const ADMIN = "00000000-0000-0000-0000-00000000000a";
const U1 = "00000000-0000-0000-0000-000000000001";
const U2 = "00000000-0000-0000-0000-000000000002";
let D1 = "";
let D2 = "";

/** Ejecuta como un usuario autenticado (RLS activo). */
async function como<T = Record<string, unknown>>(uid: string, sql: string, params: unknown[] = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid}', false); select set_config('request.jwt.claims', '{"role":"authenticated"}', false); set role authenticated;`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec("reset role; select set_config('request.jwt.claims', '', false);");
  }
}
const sistema = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => (await db.query<T>(sql, params)).rows;

beforeAll(async () => {
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
  `);
  await db.exec(mig("20261124000001_esquema.sql"));
  await db.exec(mig("20261124000002_rls_y_acciones.sql"));
  // Permisos por defecto de Supabase: RLS decide.
  await db.exec(`
    grant usage on schema public to authenticated;
    grant select, insert, update, delete on all tables in schema public to authenticated;
    grant usage on all sequences in schema public to authenticated;
  `);
  await sistema(`insert into auth.users values ($1, 'jona@monthly.la')`, [ADMIN]);
  D1 = (await sistema<{ id: string }>(`insert into despachos (nombre, email) values ('Garza y Asociados Contadores', 'Direccion@Garza.mx') returning id`))[0].id;
  D2 = (await sistema<{ id: string }>(`insert into despachos (nombre, email) values ('Otro Despacho', 'otro@despacho.mx') returning id`))[0].id;
  await sistema(`insert into auth.users values ($1, 'direccion@garza.mx'), ($2, 'otro@despacho.mx')`, [U1, U2]);
});

describe("perfiles e invitación", () => {
  it("@monthly.la es admin y el correo invitado queda ligado a su despacho", async () => {
    const p = await sistema<{ user_id: string; rol: string; despacho_id: string }>(`select user_id, rol, despacho_id from perfiles order by email`);
    expect(p).toContainEqual({ user_id: U1, rol: "despacho", despacho_id: D1 });
    expect(p).toContainEqual({ user_id: ADMIN, rol: "admin", despacho_id: null });
  });
  it("un correo sin invitación no tiene perfil", async () => {
    await sistema(`insert into auth.users values (gen_random_uuid(), 'nadie@x.mx')`);
    expect(await sistema(`select 1 from perfiles where email = 'nadie@x.mx'`)).toHaveLength(0);
  });
  it("crear un despacho crea su campaña sin programar", async () => {
    expect(await sistema(`select estado from campanas where despacho_id = $1`, [D1])).toEqual([{ estado: "sin" }]);
  });
  it("no se duplican invitaciones (correo único sin importar mayúsculas)", async () => {
    await expect(sistema(`insert into despachos (nombre, email) values ('x', 'DIRECCION@garza.mx')`)).rejects.toThrow();
  });
});

describe("RLS", () => {
  it("cada despacho solo ve lo suyo; Monthly ve todo", async () => {
    expect(await como(U1, `select id from despachos`)).toEqual([{ id: D1 }]);
    expect(await como(ADMIN, `select id from despachos`)).toHaveLength(2);
    expect(await como(U1, `select * from tokens_correo`)).toHaveLength(0);
  });
  it("el precio mínimo se valida en la base y el correo no se puede cambiar", async () => {
    await expect(como(U1, `update despachos set precio = 3000 where id = $1`, [D1])).rejects.toThrow(/mínimo/);
    await como(U1, `update despachos set precio = 4500, email = 'hack@x.mx', sitio = 'https://garza.mx', firma = 'Laura Garza' where id = $1`, [D1]);
    expect(await sistema(`select precio, email from despachos where id = $1`, [D1])).toEqual([{ precio: 4500, email: "Direccion@Garza.mx" }]);
  });
  it("no puede editar otro despacho", async () => {
    await como(U1, `update despachos set firma = 'x' where id = $1`, [D2]);
    expect(await sistema(`select firma from despachos where id = $1`, [D2])).toEqual([{ firma: "" }]);
  });
  it("importar contactos: siempre empiezan como Pendiente y no se duplican", async () => {
    await como(
      U1,
      `insert into contactos (despacho_id, empresa, nombre, correo, estatus, paso)
       values ($1, 'Aceros del Norte', 'Ricardo', ' Ricardo@Aceros.MX ', 'Confirmado', 3), ($1, 'Plásticos', 'Daniela', 'daniela@plasticos.mx', 'Pendiente', 0)
       on conflict (despacho_id, correo) do nothing`,
      [D1],
    );
    await como(U1, `insert into contactos (despacho_id, empresa, nombre, correo) values ($1, 'Aceros', 'R', 'ricardo@aceros.mx') on conflict (despacho_id, correo) do nothing`, [D1]);
    expect(await sistema(`select correo, estatus, paso from contactos order by correo`)).toEqual([
      { correo: "daniela@plasticos.mx", estatus: "Pendiente", paso: 0 },
      { correo: "ricardo@aceros.mx", estatus: "Pendiente", paso: 0 },
    ]);
  });
  it("no puede cargar contactos en otro despacho ni cambiar estatus directo", async () => {
    await expect(como(U1, `insert into contactos (despacho_id, empresa, correo) values ($1, 'x', 'x@x.mx')`, [D2])).rejects.toThrow(/row-level security/);
    await como(U1, `update contactos set estatus = 'Confirmado'`);
    expect(await sistema(`select distinct estatus from contactos`)).toEqual([{ estatus: "Pendiente" }]);
  });
  it("Monthly edita config y plantillas; el despacho no", async () => {
    await como(U1, `update config set minimo = 1`);
    expect(await sistema(`select minimo from config`)).toEqual([{ minimo: 3500 }]);
    await expect(como(ADMIN, `update config set precio_sugerido = 3000`)).rejects.toThrow(/check/);
    await como(ADMIN, `insert into plantillas (n, asunto, pre, html) values (1, 'a', 'b', 'c')`);
    await expect(como(U1, `insert into plantillas (n, asunto, pre, html) values (2, 'a', 'b', 'c')`)).rejects.toThrow(/row-level security/);
    expect(await como(U1, `select n from plantillas`)).toEqual([{ n: 1 }]);
  });
});

describe("acciones", () => {
  it("programar exige el alta completa", async () => {
    await expect(como(U1, `select programar_campana()`)).rejects.toThrow(/conectar tu correo.*confirmar la vista previa/);
    await sistema(`insert into tokens_correo (despacho_id, proveedor, email, refresh_token) values ($1, 'gmail', 'direccion@garza.mx', 'v1.x.y')`, [D1]);
    await como(U1, `update despachos set confirmo_contactos = true where id = $1`, [D1]);
    const [r] = await como<{ programar_campana: Date }>(U1, `select programar_campana()`);
    const ini = r.programar_campana.toISOString().slice(0, 10);
    const [h] = await sistema<{ h: Date }>(`select siguiente_habil(hoy_mx() + 1) as h`);
    expect(ini).toBe(h.h.toISOString().slice(0, 10));
    await expect(como(U1, `select programar_campana()`)).rejects.toThrow(/ya estaba programada/);
    expect(await sistema(`select confirmo_en is not null as ok from despachos where id = $1`, [D1])).toEqual([{ ok: true }]);
  });
  it("estado del buzón sin exponer el token", async () => {
    expect(await como(U1, `select * from estado_correo()`)).toEqual([{ proveedor: "gmail", email: "direccion@garza.mx", estado: "conectado", error: null }]);
    expect(await como(U2, `select * from estado_correo($1)`, [D1])).toEqual([]);
  });
  it("transiciones: Respondió → ✅ → Reabrir, con historial", async () => {
    const [{ id }] = await sistema<{ id: string }>(`select id from contactos where correo = 'ricardo@aceros.mx'`);
    await expect(como(U1, `select accion_contacto($1, 'confirmado')`, [id])).rejects.toThrow(/respondió/);
    await expect(como(U2, `select accion_contacto($1, 'respondio')`, [id])).rejects.toThrow(/No encontramos/);
    await como(U1, `select accion_contacto($1, 'respondio')`, [id]);
    await expect(como(U1, `select accion_contacto($1, 'pausar')`, [id])).rejects.toThrow(/ya no recibe/);
    await como(U1, `select accion_contacto($1, 'confirmado')`, [id]);
    await como(U1, `select accion_contacto($1, 'reabrir')`, [id]);
    expect(await sistema(`select estatus from contactos where id = $1`, [id])).toEqual([{ estatus: "Respondió" }]);
    expect((await como(U1, `select texto from eventos where contacto_id = $1 order by id`, [id])).map((x) => x.texto)).toEqual([
      "Marcado como respondió por el despacho",
      "Confirmado: activó su mes gratis",
      "Se deshizo el cierre",
    ]);
    expect(await como(U2, `select * from eventos`)).toHaveLength(0);
  });
  it("pausar y reanudar un contacto", async () => {
    const [{ id }] = await sistema<{ id: string }>(`select id from contactos where correo = 'daniela@plasticos.mx'`);
    await como(U1, `select accion_contacto($1, 'pausar')`, [id]);
    expect(await sistema(`select pausado from contactos where id = $1`, [id])).toEqual([{ pausado: true }]);
    await como(U1, `select accion_contacto($1, 'reanudar')`, [id]);
    expect(await sistema(`select pausado from contactos where id = $1`, [id])).toEqual([{ pausado: false }]);
  });
  it("atendido: solo Monthly, y se puede regresar", async () => {
    const [{ id }] = await sistema<{ id: string }>(`select id from contactos where correo = 'ricardo@aceros.mx'`);
    await expect(como(U1, `select marcar_atendido($1)`, [id])).rejects.toThrow(/Sin permiso/);
    expect(await como(ADMIN, `select marcar_atendido($1) as v`, [id])).toEqual([{ v: true }]);
    expect(await como(ADMIN, `select marcar_atendido($1) as v`, [id])).toEqual([{ v: false }]);
  });
  it("pausar campaña: el despacho la suya, Monthly cualquiera", async () => {
    expect(await como(U1, `select pausar_campana() as e`)).toEqual([{ e: "pausada" }]);
    expect(await como(ADMIN, `select pausar_campana($1) as e`, [D1])).toEqual([{ e: "activa" }]);
    await expect(como(U1, `select pausar_campana($1)`, [D2])).rejects.toThrow(/Sin permiso/);
    await expect(como(U2, `select pausar_campana()`)).rejects.toThrow(/no está programada/);
  });
  it("bajas: el despacho solo pregunta por sus correos; un contacto dado de baja entra en pausa", async () => {
    await sistema(`insert into supresiones (correo) values ('bajas@ejemplo.mx')`);
    expect(await como(U1, `select * from supresiones`)).toHaveLength(0);
    expect(await como(U1, `select correos_suprimidos(array['BAJAS@ejemplo.mx', 'otro@x.mx']) as c`)).toEqual([{ c: "bajas@ejemplo.mx" }]);
    await como(U1, `insert into contactos (despacho_id, empresa, nombre, correo) values ($1, 'Luna', 'Mario', 'bajas@ejemplo.mx')`, [D1]);
    expect(await sistema(`select pausado from contactos where correo = 'bajas@ejemplo.mx'`)).toEqual([{ pausado: true }]);
  });
  it("resumen del panel: solo Monthly", async () => {
    const r = await como<{ nombre: string; correo_ok: boolean; campana: string; total: number; sin_atender: number }>(ADMIN, `select * from resumen_despachos()`);
    expect(r.map((x) => [x.nombre, x.correo_ok, x.campana, x.total, x.sin_atender])).toEqual([
      ["Garza y Asociados Contadores", true, "activa", 3, 1],
      ["Otro Despacho", false, "sin", 0, 0],
    ]);
    expect(await como(U1, `select * from resumen_despachos()`)).toHaveLength(0);
    expect(await como(U1, `select total from stats_despacho`)).toEqual([{ total: 3 }]);
  });
});
