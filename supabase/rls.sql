-- ── Row Level Security ──────────────────────────────────────────────────
-- This app has no auth, so all access is open via the anon key.
-- Enable RLS and add permissive policies so PostgREST can read/write.

alter table categories enable row level security;
alter table items      enable row level security;

-- categories
create policy "anon read categories"   on categories for select using (true);
create policy "anon insert categories" on categories for insert with check (true);
create policy "anon update categories" on categories for update using (true);
create policy "anon delete categories" on categories for delete using (true);

-- items
create policy "anon read items"   on items for select using (true);
create policy "anon insert items" on items for insert with check (true);
create policy "anon update items" on items for update using (true);
create policy "anon delete items" on items for delete using (true);

-- ── Storage RLS ─────────────────────────────────────────────────────────

create policy "anon upload item-images"
    on storage.objects for insert
    with check (bucket_id = 'item-images');

create policy "anon read item-images"
    on storage.objects for select
    using (bucket_id = 'item-images');

create policy "anon delete item-images"
    on storage.objects for delete
    using (bucket_id = 'item-images');
