
-- 1) Restrict EXECUTE on has_role (SECURITY DEFINER). RLS policies still work
-- because policies are evaluated by the table owner, not the calling role.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- 2) Validate public INSERT on newsletter_subscribers (replace WITH CHECK true)
DROP POLICY IF EXISTS "Public insert subscriber" ON public.newsletter_subscribers;
CREATE POLICY "Public insert subscriber"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) <= 200
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (first_name IS NULL OR length(first_name) <= 80)
  AND (source IS NULL OR length(source) <= 60)
);

-- 3) Validate public INSERT on contact_messages (replace WITH CHECK true)
DROP POLICY IF EXISTS "Public insert contact" ON public.contact_messages;
CREATE POLICY "Public insert contact"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND length(email) <= 200
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(subject) BETWEEN 1 AND 200
  AND length(message) BETWEEN 5 AND 4000
  AND is_read = false
);

-- 4) Prevent admins from granting/modifying their OWN role (bootstrap / self-escalation protection).
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role) AND user_id <> auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) AND user_id <> auth.uid());
