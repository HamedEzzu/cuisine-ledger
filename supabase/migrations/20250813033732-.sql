-- Since this is a local-only app with no authentication, disable RLS and allow public access
-- This is safe for local use only

-- Disable RLS on all tables since no authentication is required for local app
ALTER TABLE public.income DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;  
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for local usage
-- Since RLS is disabled, these serve as documentation

-- Note: For production use, proper authentication and RLS policies should be implemented