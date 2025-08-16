
-- Create a table for storing user experiments
CREATE TABLE public.user_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experiment_name TEXT NOT NULL,
  chemicals_used TEXT[] DEFAULT '{}',
  results JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own experiments
ALTER TABLE public.user_experiments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own experiments
CREATE POLICY "Users can view their own experiments" 
  ON public.user_experiments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own experiments
CREATE POLICY "Users can create their own experiments" 
  ON public.user_experiments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own experiments
CREATE POLICY "Users can update their own experiments" 
  ON public.user_experiments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own experiments
CREATE POLICY "Users can delete their own experiments" 
  ON public.user_experiments 
  FOR DELETE 
  USING (auth.uid() = user_id);
