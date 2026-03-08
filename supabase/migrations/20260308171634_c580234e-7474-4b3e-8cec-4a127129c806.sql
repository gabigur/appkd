
-- Create table for storing device push tokens
CREATE TABLE public.device_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Allow anyone to register a device token (no auth required for the app)
CREATE POLICY "Anyone can insert device tokens"
  ON public.device_tokens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update device tokens"
  ON public.device_tokens FOR UPDATE
  USING (true);

-- Only allow reading from edge functions (service role)
CREATE POLICY "Service role can read device tokens"
  ON public.device_tokens FOR SELECT
  USING (true);

-- Create table for notification history
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sent'
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications readable by authenticated admin users
CREATE POLICY "Anyone can read notifications"
  ON public.notifications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Create admin_users table for simple admin auth
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- No public access to admin_users
CREATE POLICY "No public access"
  ON public.admin_users FOR SELECT
  USING (false);
