-- Tabla de movimientos para la PWA de Contabilidad
create table if not exists public.movements (
  id text primary key,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  concept text not null,
  date timestamptz not null default now(),
  receipt_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- Habilitar Row Level Security (RLS)
alter table public.movements enable row level security;

-- Política de lectura y escritura libre con API Key anónima (protegido por PIN en la app)
create policy "Acceso completo a movimientos"
  on public.movements
  for all
  using (true)
  with check (true);

-- Habilitar Realtime para reflejo instantáneo en todos los teléfonos
alter publication supabase_realtime add table public.movements;
