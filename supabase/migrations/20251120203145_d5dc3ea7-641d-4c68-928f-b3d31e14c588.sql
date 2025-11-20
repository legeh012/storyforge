-- Re-enable RLS on critical tables and set up proper policies

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing public access policies on profiles
DROP POLICY IF EXISTS "Public access" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update to profiles" ON public.profiles;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing public access policies on projects
DROP POLICY IF EXISTS "Public access" ON public.projects;
DROP POLICY IF EXISTS "Allow public delete to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public insert to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public update to projects" ON public.projects;

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Enable RLS on episodes
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Drop existing public access policies on episodes
DROP POLICY IF EXISTS "Public access" ON public.episodes;
DROP POLICY IF EXISTS "Allow public delete to episodes" ON public.episodes;
DROP POLICY IF EXISTS "Allow public insert to episodes" ON public.episodes;
DROP POLICY IF EXISTS "Allow public read access to episodes" ON public.episodes;
DROP POLICY IF EXISTS "Allow public update to episodes" ON public.episodes;

-- Episodes policies
CREATE POLICY "Users can view own episodes"
  ON public.episodes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own episodes"
  ON public.episodes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own episodes"
  ON public.episodes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own episodes"
  ON public.episodes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Enable RLS on characters
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Drop existing public access policies on characters
DROP POLICY IF EXISTS "Public access" ON public.characters;
DROP POLICY IF EXISTS "Allow public delete to characters" ON public.characters;
DROP POLICY IF EXISTS "Allow public insert to characters" ON public.characters;
DROP POLICY IF EXISTS "Allow public read access to characters" ON public.characters;
DROP POLICY IF EXISTS "Allow public update to characters" ON public.characters;

-- Characters policies
CREATE POLICY "Users can view own characters"
  ON public.characters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own characters"
  ON public.characters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
  ON public.characters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own characters"
  ON public.characters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Enable RLS on media_assets
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Drop existing public access policies on media_assets
DROP POLICY IF EXISTS "Public access" ON public.media_assets;
DROP POLICY IF EXISTS "Allow public delete to media_assets" ON public.media_assets;
DROP POLICY IF EXISTS "Allow public insert to media_assets" ON public.media_assets;
DROP POLICY IF EXISTS "Allow public read access to media_assets" ON public.media_assets;
DROP POLICY IF EXISTS "Allow public update to media_assets" ON public.media_assets;

-- Media assets policies
CREATE POLICY "Users can view own media assets"
  ON public.media_assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own media assets"
  ON public.media_assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media assets"
  ON public.media_assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own media assets"
  ON public.media_assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Enable RLS on bot_activities
ALTER TABLE public.bot_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing public access policies on bot_activities
DROP POLICY IF EXISTS "Public access" ON public.bot_activities;
DROP POLICY IF EXISTS "Allow public delete to bot_activities" ON public.bot_activities;
DROP POLICY IF EXISTS "Allow public insert to bot_activities" ON public.bot_activities;
DROP POLICY IF EXISTS "Allow public read access to bot_activities" ON public.bot_activities;
DROP POLICY IF EXISTS "Allow public update to bot_activities" ON public.bot_activities;

-- Bot activities policies
CREATE POLICY "Users can view own bot activities"
  ON public.bot_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own bot activities"
  ON public.bot_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bot activities"
  ON public.bot_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own bot activities"
  ON public.bot_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Enable RLS on generation_attachments
ALTER TABLE public.generation_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing public access policies on generation_attachments
DROP POLICY IF EXISTS "Public access" ON public.generation_attachments;
DROP POLICY IF EXISTS "Allow public delete to generation_attachments" ON public.generation_attachments;
DROP POLICY IF EXISTS "Allow public insert to generation_attachments" ON public.generation_attachments;
DROP POLICY IF EXISTS "Allow public read access to generation_attachments" ON public.generation_attachments;
DROP POLICY IF EXISTS "Allow public update to generation_attachments" ON public.generation_attachments;

-- Generation attachments policies
CREATE POLICY "Users can view own attachments"
  ON public.generation_attachments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own attachments"
  ON public.generation_attachments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attachments"
  ON public.generation_attachments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own attachments"
  ON public.generation_attachments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user function to check for admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Check if email is in admin list
  IF NEW.email IN ('lucky.egeh012@gmail.com', 'legeh01@nmsu.edu', 'lucky.egeh0123@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'creator');
  END IF;
  
  RETURN NEW;
END;
$$;