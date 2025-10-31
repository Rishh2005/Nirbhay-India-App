-- Add incident reports table with evidence tracking
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  incident_type TEXT NOT NULL,
  location_hash TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'false_alarm', 'resolved')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  blockchain_hash TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add evidence storage table
CREATE TABLE IF NOT EXISTS public.evidence_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('photo', 'video', 'audio', 'document')),
  file_path TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  ipfs_cid TEXT,
  blockchain_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add travel safety logs
CREATE TABLE IF NOT EXISTS public.travel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  start_location TEXT,
  start_lat DOUBLE PRECISION,
  start_lng DOUBLE PRECISION,
  destination TEXT,
  dest_lat DOUBLE PRECISION,
  dest_lng DOUBLE PRECISION,
  expected_duration INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'alerted', 'cancelled')),
  route_data JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_arrival TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add community safety reports
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('harassment', 'unsafe_area', 'suspicious_activity', 'well_lit', 'safe_spot', 'police_presence')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT,
  severity INTEGER DEFAULT 5,
  verified BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add guardian verification table (blockchain-style)
CREATE TABLE IF NOT EXISTS public.guardian_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  guardian_contact_id UUID REFERENCES public.emergency_contacts(id),
  verification_code TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_method TEXT CHECK (verification_method IN ('sms', 'email', 'blockchain', 'manual')),
  verified_at TIMESTAMP WITH TIME ZONE,
  blockchain_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_verification ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incident_reports
CREATE POLICY "Users can view their own incidents"
  ON public.incident_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create incidents"
  ON public.incident_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their incidents"
  ON public.incident_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for evidence_records
CREATE POLICY "Users can view their own evidence"
  ON public.evidence_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create evidence"
  ON public.evidence_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for travel_logs
CREATE POLICY "Users can view their own travel logs"
  ON public.travel_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create travel logs"
  ON public.travel_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their travel logs"
  ON public.travel_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for community_reports
CREATE POLICY "Anyone can view community reports"
  ON public.community_reports FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON public.community_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id OR auth.uid() IS NOT NULL);

-- RLS Policies for guardian_verification
CREATE POLICY "Users can view their guardian verifications"
  ON public.guardian_verification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create guardian verifications"
  ON public.guardian_verification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_incident_reports_updated_at
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_incident_reports_user_id ON public.incident_reports(user_id);
CREATE INDEX idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX idx_evidence_records_incident_id ON public.evidence_records(incident_id);
CREATE INDEX idx_travel_logs_user_id ON public.travel_logs(user_id);
CREATE INDEX idx_travel_logs_status ON public.travel_logs(status);
CREATE INDEX idx_community_reports_location ON public.community_reports(latitude, longitude);
CREATE INDEX idx_community_reports_type ON public.community_reports(report_type);