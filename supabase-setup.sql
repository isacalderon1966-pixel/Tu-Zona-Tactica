-- ============================================================
-- ⚡ SUPABASE — Tu Zona Táctica CCS (script de instalación)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1) TABLA DE DATOS ADMINISTRADOS (productos, envíos, ajustes)
create table if not exists app_data (
    key text primary key,
    value jsonb not null default '[]'::jsonb,
    updated_at timestamptz not null default now()
);

-- 2) PEDIDOS (los confirma el cliente desde su teléfono)
create table if not exists orders (
    id text primary key,
    customer_name text not null,
    customer_phone text default '',
    products jsonb default '[]'::jsonb,
    total numeric default 0,
    status text default 'pending',
    created_at timestamptz default now()
);

-- 3) VERIFICACIONES DE IDENTIDAD (con foto de credencial)
create table if not exists verifications (
    id text primary key,
    full_name text not null,
    identity text default '',
    police_body text default '',
    credential text default '',
    credential_number text default '',
    email text default '',
    credential_image text default '',
    status text default 'pending',
    submitted_at timestamptz default now(),
    reviewed_at text
);

-- 4) DEVOLUCIONES (las solicita el cliente desde su garantía)
create table if not exists returns (
    id text primary key,
    shipping_id text,
    customer_name text not null,
    customer_phone text default '',
    products jsonb default '[]'::jsonb,
    reason text default '',
    status text default 'pendiente',
    requested_at timestamptz default now(),
    reviewed_at text,
    review_note text default ''
);

-- 5) SEGURIDAD (Row Level Security)
alter table app_data enable row level security;
alter table orders enable row level security;
alter table verifications enable row level security;
alter table returns enable row level security;

-- Nota: "drop policy if exists" permite volver a ejecutar este script sin errores
-- y ACTUALIZA las políticas a la versión más reciente.

-- Lectura pública SOLO de lo que la tienda necesita (productos, envíos y ajustes)
drop policy if exists "app_data_select" on app_data;
create policy "app_data_select" on app_data for select using (true);

-- PEDIDOS: solo el ADMIN autenticado puede leerlos (contienen nombres y teléfonos)
drop policy if exists "orders_select" on orders;
create policy "orders_select" on orders for select using (auth.role() = 'authenticated');

-- VERIFICACIONES: solo el ADMIN autenticado puede leerlas (contienen fotos de credenciales).
-- El cliente consulta su estado con la función RPC identity_is_approved (más abajo).
drop policy if exists "verifications_select" on verifications;
create policy "verifications_select" on verifications for select using (auth.role() = 'authenticated');

-- DEVOLUCIONES: lectura pública (la consulta de garantía del cliente muestra su estado)
drop policy if exists "returns_select" on returns;
create policy "returns_select" on returns for select using (true);

-- Los clientes pueden ENVIAR pedidos, verificaciones y devoluciones
drop policy if exists "orders_insert" on orders;
create policy "orders_insert" on orders for insert with check (true);
drop policy if exists "verifications_insert" on verifications;
create policy "verifications_insert" on verifications for insert with check (true);
drop policy if exists "returns_insert" on returns;
create policy "returns_insert" on returns for insert with check (true);

-- Solo el ADMIN autenticado modifica o elimina
drop policy if exists "app_data_admin_write" on app_data;
create policy "app_data_admin_write" on app_data for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "orders_admin_update" on orders;
create policy "orders_admin_update" on orders for update
    using (auth.role() = 'authenticated');
drop policy if exists "orders_admin_delete" on orders;
create policy "orders_admin_delete" on orders for delete
    using (auth.role() = 'authenticated');
drop policy if exists "verifications_admin_update" on verifications;
create policy "verifications_admin_update" on verifications for update
    using (auth.role() = 'authenticated');
drop policy if exists "verifications_admin_delete" on verifications;
create policy "verifications_admin_delete" on verifications for delete
    using (auth.role() = 'authenticated');
drop policy if exists "returns_admin_update" on returns;
create policy "returns_admin_update" on returns for update
    using (auth.role() = 'authenticated');
drop policy if exists "returns_admin_delete" on returns;
create policy "returns_admin_delete" on returns for delete
    using (auth.role() = 'authenticated');

-- 5.1) FUNCIÓN RPC PARA VERIFICAR IDENTIDAD SIN EXPONER CREDENCIALES
-- El cliente envía su nombre completo y recibe SOLO true/false (nunca los datos de otros)
create or replace function public.identity_is_approved(p_full_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from verifications
        where status = 'approved'
          and lower(btrim(full_name)) = lower(btrim(p_full_name))
    );
$$;

grant execute on function public.identity_is_approved(text) to anon, authenticated;

-- 6) SINCRONIZACIÓN EN VIVO (Realtime)
-- Habilita estas tablas en: Database → Replication → supabase_realtime
alter publication supabase_realtime add table app_data;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table verifications;
alter publication supabase_realtime add table returns;