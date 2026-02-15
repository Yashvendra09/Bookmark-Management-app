-- Create a table for bookmarks
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table bookmarks enable row level security;

-- Create a policy that allows users to select only their own bookmarks
create policy "Users can select their own bookmarks"
  on bookmarks for select
  using ( auth.uid() = user_id );

-- Create a policy that allows users to insert their own bookmarks
create policy "Users can insert their own bookmarks"
  on bookmarks for insert
  with check ( auth.uid() = user_id );

-- Create a policy that allows users to delete their own bookmarks
create policy "Users can delete their own bookmarks"
  on bookmarks for delete
  using ( auth.uid() = user_id );

-- Create a policy that allows users to update their own bookmarks (optional, but good practice)
create policy "Users can update their own bookmarks"
  on bookmarks for update
  using ( auth.uid() = user_id );
