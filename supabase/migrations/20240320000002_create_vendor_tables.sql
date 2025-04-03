-- Create enum for payment schedules
create type public.payment_schedule_type as enum (
  'weekly',
  'biweekly',
  'on_demand'
);

-- Create accounts table
create table public.accounts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  balance decimal(12,2) not null default 200000.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vendors table
create table public.vendors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  payment_schedule payment_schedule_type not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payments table
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete cascade not null,
  amount decimal(12,2) not null,
  payment_date date not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.accounts enable row level security;
alter table public.vendors enable row level security;
alter table public.payments enable row level security;

-- Create policies
create policy "Users can view all accounts"
  on public.accounts for select
  using (true);

create policy "Users can view all vendors"
  on public.vendors for select
  using (true);

create policy "Users can view all payments"
  on public.payments for select
  using (true);

create policy "Users can insert vendors"
  on public.vendors for insert
  with check (true);

create policy "Users can update vendors"
  on public.vendors for update
  using (true);

create policy "Users can delete vendors"
  on public.vendors for delete
  using (true);

create policy "Users can insert payments"
  on public.payments for insert
  with check (true);

create policy "Users can update payments"
  on public.payments for update
  using (true);

create policy "Users can delete payments"
  on public.payments for delete
  using (true);

-- Create triggers for updated_at
create trigger handle_accounts_updated_at
  before update on public.accounts
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_vendors_updated_at
  before update on public.vendors
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_payments_updated_at
  before update on public.payments
  for each row
  execute procedure public.handle_updated_at();

-- Insert initial accounts
insert into public.accounts (name) values
  ('Account 1'),
  ('Account 2');

-- Insert initial vendors
insert into public.vendors (name, payment_schedule) values
  ('Vendor 1', 'weekly'),
  ('Vendor 2', 'weekly'),
  ('Vendor 3', 'weekly'),
  ('Vendor 4', 'weekly'),
  ('Vendor 5', 'weekly'),
  ('Vendor 6', 'biweekly'),
  ('Vendor 7', 'biweekly'),
  ('Vendor 8', 'biweekly'),
  ('Vendor 9', 'biweekly'),
  ('Vendor 10', 'biweekly'),
  ('Vendor 11', 'on_demand'),
  ('Vendor 12', 'on_demand'),
  ('Vendor 13', 'on_demand'),
  ('Vendor 14', 'on_demand'),
  ('Vendor 15', 'on_demand'),
  ('Vendor 16', 'on_demand'),
  ('Vendor 17', 'on_demand'),
  ('Vendor 18', 'on_demand'),
  ('Vendor 19', 'on_demand'),
  ('Vendor 20', 'on_demand'); 