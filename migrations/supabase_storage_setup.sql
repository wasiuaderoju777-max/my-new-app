-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create the storage bucket (if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('whatsorder-media', 'whatsorder-media', true)
on conflict (id) do nothing;

-- 2. Drop existing policies to avoid conflicts (clean slate)
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow public viewing" on storage.objects;
drop policy if exists "Allow authenticated updates" on storage.objects;

-- 3. Create policies
-- Allow authenticated users to upload files
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'whatsorder-media' );

-- Allow public viewing of files
create policy "Allow public viewing"
on storage.objects for select
to public
using ( bucket_id = 'whatsorder-media' );

-- Allow authenticated users to update their own files
create policy "Allow authenticated updates"
on storage.objects for update
to authenticated
using ( bucket_id = 'whatsorder-media' );
