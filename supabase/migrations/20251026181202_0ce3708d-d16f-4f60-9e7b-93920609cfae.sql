-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  emergency_message TEXT DEFAULT 'I need help! Please check my location.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create emergency contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT,
  priority INTEGER DEFAULT 1,
  is_guardian BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on emergency contacts
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Emergency contacts policies
CREATE POLICY "Users can view their own contacts"
  ON public.emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON public.emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Create SOS alerts table
CREATE TABLE public.sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  alert_type TEXT DEFAULT 'manual' CHECK (alert_type IN ('manual', 'implicit', 'voice')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS on SOS alerts
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- SOS alerts policies
CREATE POLICY "Users can view their own alerts"
  ON public.sos_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
  ON public.sos_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.sos_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Create safety zones table
CREATE TABLE public.safety_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('safe', 'caution', 'danger')),
  radius DOUBLE PRECISION DEFAULT 500,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on safety zones
ALTER TABLE public.safety_zones ENABLE ROW LEVEL SECURITY;

-- Safety zones policies - public read, authenticated write
CREATE POLICY "Anyone can view safety zones"
  ON public.safety_zones FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create zones"
  ON public.safety_zones FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Trigger to update profiles updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();