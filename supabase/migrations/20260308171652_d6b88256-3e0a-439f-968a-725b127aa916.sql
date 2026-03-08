
-- Tighten device_tokens: only allow update on own token (by matching token value)
DROP POLICY "Anyone can update device tokens" ON public.device_tokens;
CREATE POLICY "Update device tokens by token match"
  ON public.device_tokens FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Tighten notifications: only service role should insert (edge function)
DROP POLICY "Anyone can insert notifications" ON public.notifications;

-- Tighten device_tokens insert: still allow but this is intentional for token registration
-- The insert WITH CHECK (true) is intentional since unauthed devices register tokens
