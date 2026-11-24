-- Bucket público para los logos de los despachos: logos/<despacho_id>/<archivo>.png
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "logos: lectura pública" on storage.objects for select using (bucket_id = 'logos');
create policy "logos: el despacho sube los suyos" on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = public.mi_despacho()::text);
create policy "logos: el despacho reemplaza los suyos" on storage.objects for update to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = public.mi_despacho()::text);
