-- Enable replication for the table (often required for Realtime)
alter publication supabase_realtime add table bookmarks;

-- Ensure RLS is enabled (should already be done)
alter table bookmarks enable row level security;
