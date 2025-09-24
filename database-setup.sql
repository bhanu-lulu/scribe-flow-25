-- Personal Notes Hub Database Setup
-- Run this in your Supabase SQL editor to set up the database

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Note',
    content TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security on notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own notes
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own notes
CREATE POLICY "Users can insert their own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own notes
CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own notes
CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on notes
CREATE TRIGGER on_notes_updated
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance on user queries
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS notes_tags_idx ON public.notes USING GIN(tags);

-- Create a view for note statistics (optional)
CREATE OR REPLACE VIEW public.user_note_stats AS
SELECT 
    user_id,
    COUNT(*) as total_notes,
    COUNT(*) FILTER (WHERE tags && ARRAY['Work']) as work_notes,
    COUNT(*) FILTER (WHERE tags && ARRAY['Personal']) as personal_notes,
    COUNT(*) FILTER (WHERE tags && ARRAY['Learning']) as learning_notes,
    COUNT(*) FILTER (WHERE tags && ARRAY['Ideas']) as idea_notes,
    MAX(updated_at) as last_updated
FROM public.notes
GROUP BY user_id;

-- Grant access to the authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT SELECT ON public.user_note_stats TO authenticated;

-- Insert some sample data (optional - remove in production)
-- This will only work if you have a user already created
/*
INSERT INTO public.notes (user_id, title, content, tags) VALUES
    (auth.uid(), 'Welcome to Personal Notes Hub', '<h1>Welcome!</h1><p>This is your first note. You can format text with <strong>bold</strong>, <em>italic</em>, and more.</p><ul><li>Create new notes</li><li>Organize with tags</li><li>Search through your content</li></ul>', ARRAY['Getting Started']),
    (auth.uid(), 'Meeting Notes Template', '<h2>Meeting Notes</h2><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><p><strong>Agenda:</strong></p><ul><li>Item 1</li><li>Item 2</li></ul><p><strong>Action Items:</strong></p><ul><li>[ ] Task 1</li><li>[ ] Task 2</li></ul>', ARRAY['Work', 'Templates']);
*/