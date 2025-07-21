-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drones table
CREATE TABLE public.drones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'flying', 'maintenance', 'offline')),
  battery_level INTEGER DEFAULT 100,
  location_lat DECIMAL,
  location_lng DECIMAL,
  altitude DECIMAL DEFAULT 0,
  speed DECIMAL DEFAULT 0,
  heading DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create telemetry table for real-time data
CREATE TABLE public.telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drone_id UUID NOT NULL REFERENCES public.drones(id) ON DELETE CASCADE,
  altitude DECIMAL NOT NULL,
  speed DECIMAL NOT NULL,
  heading DECIMAL NOT NULL,
  battery_level INTEGER NOT NULL,
  gps_satellites INTEGER NOT NULL,
  signal_strength INTEGER NOT NULL,
  temperature DECIMAL,
  humidity DECIMAL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drone_id UUID REFERENCES public.drones(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  ai_recommendation TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drone_id UUID NOT NULL REFERENCES public.drones(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'aborted')),
  waypoints JSONB NOT NULL DEFAULT '[]',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for drones (all authenticated users can view)
CREATE POLICY "Authenticated users can view drones" ON public.drones
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can modify drones" ON public.drones
FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for telemetry (all authenticated users can view)
CREATE POLICY "Authenticated users can view telemetry" ON public.telemetry
FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert telemetry" ON public.telemetry
FOR INSERT TO authenticated WITH CHECK (true);

-- Create policies for alerts (all authenticated users can view)
CREATE POLICY "Authenticated users can view alerts" ON public.alerts
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can acknowledge alerts" ON public.alerts
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "System can create alerts" ON public.alerts
FOR INSERT TO authenticated WITH CHECK (true);

-- Create policies for missions
CREATE POLICY "Users can view all missions" ON public.missions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create missions" ON public.missions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own missions" ON public.missions
FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drones_updated_at
BEFORE UPDATE ON public.drones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
BEFORE UPDATE ON public.missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample drone data
INSERT INTO public.drones (name, model, status, battery_level, location_lat, location_lng, altitude, speed, heading) VALUES
('Phantom-001', 'DJI Phantom 4 Pro', 'flying', 87, 40.7128, -74.0060, 125.5, 15.2, 45.8),
('Mavic-002', 'DJI Mavic Air 2', 'idle', 92, 40.7589, -73.9851, 0, 0, 0),
('Inspire-003', 'DJI Inspire 2', 'maintenance', 45, 40.7505, -73.9934, 0, 0, 0);