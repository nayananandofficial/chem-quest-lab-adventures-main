
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL DEFAULT 'beginner',
  content JSONB NOT NULL,
  objectives TEXT[],
  estimated_duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user lesson progress table
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) NOT NULL DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create periodic table elements table
CREATE TABLE public.periodic_elements (
  id SERIAL PRIMARY KEY,
  atomic_number INTEGER UNIQUE NOT NULL,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  atomic_mass DECIMAL(10,6),
  electron_configuration TEXT,
  group_number INTEGER,
  period_number INTEGER,
  block TEXT,
  category TEXT,
  color_hex TEXT DEFAULT '#CCCCCC',
  description TEXT,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user experiments table to track user's lab activities
CREATE TABLE public.user_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_name TEXT NOT NULL,
  chemicals_used TEXT[],
  results JSONB,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodic_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_experiments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Lessons policies (public read access)
CREATE POLICY "Anyone can view lessons" ON public.lessons
  FOR SELECT USING (true);

-- User lesson progress policies
CREATE POLICY "Users can view their own progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Periodic elements policies (public read access)
CREATE POLICY "Anyone can view periodic elements" ON public.periodic_elements
  FOR SELECT USING (true);

-- User experiments policies
CREATE POLICY "Users can view their own experiments" ON public.user_experiments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experiments" ON public.user_experiments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample lessons
INSERT INTO public.lessons (title, description, difficulty_level, content, objectives, estimated_duration_minutes) VALUES
(
  'Introduction to Chemical Reactions',
  'Learn the basics of chemical reactions and how to safely conduct experiments in the lab.',
  'beginner',
  '{"steps": ["Safety first - understand lab equipment", "Learn about acids and bases", "Perform acid-base neutralization", "Observe color changes"], "chemicals": ["HCl", "NaOH"], "equipment": ["beaker", "burner"]}'::jsonb,
  ARRAY['Understand safety protocols', 'Identify acids and bases', 'Perform neutralization reaction'],
  20
),
(
  'Advanced Chemical Synthesis',
  'Explore complex chemical reactions and synthesis techniques.',
  'advanced',
  '{"steps": ["Prepare reactants", "Control reaction temperature", "Monitor reaction progress", "Analyze products"], "chemicals": ["CuSO4", "Fe2O3", "Mg"], "equipment": ["flask", "burner", "beaker"]}'::jsonb,
  ARRAY['Master temperature control', 'Understand reaction mechanisms', 'Analyze reaction products'],
  45
);

-- Insert periodic table elements (first 20 elements)
INSERT INTO public.periodic_elements (atomic_number, symbol, name, atomic_mass, group_number, period_number, block, category, color_hex, description) VALUES
(1, 'H', 'Hydrogen', 1.008, 1, 1, 's', 'nonmetal', '#FFFFFF', 'The lightest and most abundant element in the universe'),
(2, 'He', 'Helium', 4.003, 18, 1, 's', 'noble gas', '#D9FFFF', 'An inert noble gas used in balloons and as a coolant'),
(3, 'Li', 'Lithium', 6.941, 1, 2, 's', 'alkali metal', '#CC80FF', 'A soft, silvery-white alkali metal'),
(4, 'Be', 'Beryllium', 9.012, 2, 2, 's', 'alkaline earth metal', '#C2FF00', 'A lightweight, strong metal used in aerospace'),
(5, 'B', 'Boron', 10.811, 13, 2, 'p', 'metalloid', '#FFB5B5', 'A metalloid used in glass and ceramics'),
(6, 'C', 'Carbon', 12.011, 14, 2, 'p', 'nonmetal', '#909090', 'The basis of all organic chemistry'),
(7, 'N', 'Nitrogen', 14.007, 15, 2, 'p', 'nonmetal', '#3050F8', 'Makes up 78% of Earth\'s atmosphere'),
(8, 'O', 'Oxygen', 15.999, 16, 2, 'p', 'nonmetal', '#FF0D0D', 'Essential for respiration and combustion'),
(9, 'F', 'Fluorine', 18.998, 17, 2, 'p', 'halogen', '#90E050', 'The most electronegative element'),
(10, 'Ne', 'Neon', 20.180, 18, 2, 'p', 'noble gas', '#B3E3F5', 'Used in neon signs and lighting'),
(11, 'Na', 'Sodium', 22.990, 1, 3, 's', 'alkali metal', '#AB5CF2', 'A soft metal that reacts violently with water'),
(12, 'Mg', 'Magnesium', 24.305, 2, 3, 's', 'alkaline earth metal', '#8AFF00', 'Burns with a bright white flame'),
(13, 'Al', 'Aluminum', 26.982, 13, 3, 'p', 'metal', '#BFA6A6', 'A lightweight, corrosion-resistant metal'),
(14, 'Si', 'Silicon', 28.086, 14, 3, 'p', 'metalloid', '#F0C8A0', 'The second most abundant element in Earth\'s crust'),
(15, 'P', 'Phosphorus', 30.974, 15, 3, 'p', 'nonmetal', '#FF8000', 'Essential for life, found in DNA and ATP'),
(16, 'S', 'Sulfur', 32.065, 16, 3, 'p', 'nonmetal', '#FFFF30', 'Known for its yellow color and distinctive smell'),
(17, 'Cl', 'Chlorine', 35.453, 17, 3, 'p', 'halogen', '#1FF01F', 'A toxic gas used in water purification'),
(18, 'Ar', 'Argon', 39.948, 18, 3, 'p', 'noble gas', '#80D1E3', 'An inert gas used in light bulbs'),
(19, 'K', 'Potassium', 39.098, 1, 4, 's', 'alkali metal', '#8F40D4', 'Essential for nerve and muscle function'),
(20, 'Ca', 'Calcium', 40.078, 2, 4, 's', 'alkaline earth metal', '#3DFF00', 'Essential for bones and teeth');
