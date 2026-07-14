-- Supabase Schema for 'My Event' App (Including Google Tasks Support)

-- 1. Create the events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT DEFAULT '' NOT NULL,
    is_paid BOOLEAN DEFAULT false NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    is_task BOOLEAN DEFAULT false NOT NULL,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    organization TEXT DEFAULT '' NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies to allow any client with the Anon API key to read/write
CREATE POLICY "Allow public select" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.events FOR DELETE USING (true);

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS events_date_idx ON public.events(date);
CREATE INDEX IF NOT EXISTS events_is_task_idx ON public.events(is_task);

-- 5. Create app_settings table for dynamic password/settings sync
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Enable RLS for settings table
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create public access policies for settings table
CREATE POLICY "Allow public select" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.app_settings FOR UPDATE USING (true) WITH CHECK (true);

-- Insert default site password
INSERT INTO public.app_settings (key, value)
VALUES ('site_password', 'mrevent2026')
ON CONFLICT (key) DO NOTHING;

