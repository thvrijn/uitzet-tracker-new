-- ── Tables ──────────────────────────────────────────────────────────────

create table if not exists categories (
    name text primary key
);

create table if not exists items (
    id          uuid        primary key default gen_random_uuid(),
    name        text        not null,
    category    text        references categories(name) on update cascade on delete set null,
    status      text        not null default 'gewenst' check (status in ('gewenst', 'besteld', 'ontvangen')),
    price       numeric     not null default 0,
    amount      integer     not null default 1,
    image       text        not null default '',
    url         text        not null default '',
    order_date  date,
    storage_location text   not null default '',
    created_at  timestamptz not null default now()
);

-- ── Default categories ──────────────────────────────────────────────────

insert into categories (name) values
    ('Keuken'),
    ('Slaapkamer'),
    ('Woonkamer'),
    ('Badkamer'),
    ('Kantoor'),
    ('Tuin'),
    ('Overig')
on conflict do nothing;

-- ── Storage bucket ──────────────────────────────────────────────────────
-- Run this once in the Supabase dashboard → Storage, or via SQL editor:

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict do nothing;
