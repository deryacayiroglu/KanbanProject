-- 1. Enable UUID Extension (usually enabled by default in Supabase, but good practice)
create extension if not exists "uuid-ossp";

-- 2. Create Tables
-- BOARDS
create table public.boards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COLUMNS
create table public.columns (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid references public.boards(id) on delete cascade not null,
  title text not null,
  position double precision not null, -- Double precision is ideal for fractional ordering (e.g. dragging between items)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CARDS
create table public.cards (
  id uuid default uuid_generate_v4() primary key,
  column_id uuid references public.columns(id) on delete cascade not null,
  title text not null,
  description text,
  position double precision not null,
  label text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Performance Indexes
create index idx_boards_user_id on public.boards(user_id);
create index idx_columns_board_id on public.columns(board_id);
create index idx_columns_position on public.columns(position);
create index idx_cards_column_id on public.cards(column_id);
create index idx_cards_position on public.cards(position);

-- 4. Set up Trigger for `updated_at` on cards
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_cards_updated
  before update on public.cards
  for each row execute procedure public.handle_updated_at();

-- 5. Enable Row Level Security (RLS)
alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.cards enable row level security;

-- 6. RLS Policies for BOARDS
create policy "Users can view their own boards"
  on public.boards for select using (auth.uid() = user_id);

create policy "Users can create their own boards"
  on public.boards for insert with check (auth.uid() = user_id);

create policy "Users can update their own boards"
  on public.boards for update using (auth.uid() = user_id);

create policy "Users can delete their own boards"
  on public.boards for delete using (auth.uid() = user_id);

-- 7. RLS Policies for COLUMNS
-- (A user can manage columns if they own the board the column belongs to)
create policy "Users can manage columns through boards"
  on public.columns for all
  using (
    board_id in (
      select id from public.boards where user_id = auth.uid()
    )
  );

-- 8. RLS Policies for CARDS
-- (A user can manage cards if they own the board the card's column belongs to)
create policy "Users can manage cards through columns and boards"
  on public.cards for all
  using (
    column_id in (
      select id from public.columns 
      where board_id in (
        select id from public.boards where user_id = auth.uid()
      )
    )
  );
