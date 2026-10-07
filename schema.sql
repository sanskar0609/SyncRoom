-- SyncRoom Supabase Schema Setup

-- 1. Create Tables
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    host_user_id TEXT NOT NULL,
    password_hash TEXT,
    is_private BOOLEAN DEFAULT false,
    allow_everyone_control BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail TEXT,
    channel_name TEXT,
    added_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.room_state (
    room_id UUID PRIMARY KEY REFERENCES public.rooms(id) ON DELETE CASCADE,
    current_song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
    current_video_id TEXT,
    is_playing BOOLEAN DEFAULT false,
    "current_time" NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Realtime Publications
-- Enable realtime for state syncing and chat
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_members;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.room_state;
alter publication supabase_realtime add table public.songs;


-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_state ENABLE ROW LEVEL SECURITY;

-- Since this is an MVP without complex JWT auth for guests (relying on anon keys with arbitrary guest IDs), 
-- we will create very permissive policies for the anon role initially. 
-- In a production environment, you would use custom JWTs or tighter function checks.

-- Rooms: Anyone can read, anyone can create.
CREATE POLICY "Anyone can select rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);

-- Users: Anyone can manage their guest user profile.
CREATE POLICY "Anyone can select users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update users" ON public.users FOR UPDATE USING (true);

-- Room Members: Anyone can view, join or leave.
CREATE POLICY "Anyone can select members" ON public.room_members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert members" ON public.room_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update members" ON public.room_members FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete members" ON public.room_members FOR DELETE USING (true);

-- Songs: Anyone can view, add, or manage.
CREATE POLICY "Anyone can select songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert songs" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update songs" ON public.songs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete songs" ON public.songs FOR DELETE USING (true);

-- Messages: Anyone can read and send messages.
CREATE POLICY "Anyone can select messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);

-- Room State: Anyone can view and update state.
CREATE POLICY "Anyone can select state" ON public.room_state FOR SELECT USING (true);
CREATE POLICY "Anyone can insert state" ON public.room_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update state" ON public.room_state FOR UPDATE USING (true);
