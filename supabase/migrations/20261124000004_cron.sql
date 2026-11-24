-- Motor de envío: pg_cron llama a la Edge Function enviar-pendientes cada 15 minutos
-- en días hábiles de 9:00 a 10:45, hora del centro de México (UTC−6 todo el año desde 2022).
-- pg_cron corre en UTC: 15:00–16:45 UTC. La función vuelve a revisar la ventana y los festivos.
--
-- ANTES de que funcione, guarda dos secretos en Vault (SQL editor de Supabase):
--   select vault.create_secret('https://<ref>.supabase.co', 'project_url');
--   select vault.create_secret('<el mismo valor que CRON_SECRET en las Edge Functions>', 'cron_secret');

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'enviar-pendientes',
  '*/15 15-16 * * 1-5',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/enviar-pendientes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
