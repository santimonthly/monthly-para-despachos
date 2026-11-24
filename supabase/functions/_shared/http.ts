export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json" } });

export const error = (mensaje: string, status = 400) => json({ error: mensaje }, status);

export const preflight = (req: Request) => (req.method === "OPTIONS" ? new Response("ok", { headers: CORS }) : null);
