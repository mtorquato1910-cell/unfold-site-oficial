
-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#6DF9C6',
  type text NOT NULL DEFAULT 'post',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read categories" ON public.categories FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff write categories" ON public.categories FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Media
CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  type text NOT NULL DEFAULT 'image',
  mime_type text,
  size_bytes bigint,
  alt text,
  tags text[] DEFAULT '{}',
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read media" ON public.media FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff write media" ON public.media FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

-- Quiz questions
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  category text,
  weight numeric NOT NULL DEFAULT 1,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read quiz" ON public.quiz_questions FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff write quiz" ON public.quiz_questions FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE TRIGGER trg_quiz_updated BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Insight variations
CREATE TABLE public.insight_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  maturity_level text NOT NULL,
  category text,
  min_score int NOT NULL DEFAULT 0,
  max_score int NOT NULL DEFAULT 100,
  content text NOT NULL,
  recommendations text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.insight_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read insights" ON public.insight_variations FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff write insights" ON public.insight_variations FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE TRIGGER trg_insights_updated BEFORE UPDATE ON public.insight_variations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AI Prompts
CREATE TABLE public.ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  description text,
  content text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  model text DEFAULT 'google/gemini-2.5-flash',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read prompts" ON public.ai_prompts FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff write prompts" ON public.ai_prompts FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE TRIGGER trg_prompts_updated BEFORE UPDATE ON public.ai_prompts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Audit Log
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read audit" ON public.audit_log FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Admin delete audit" ON public.audit_log FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_audit_created ON public.audit_log(created_at DESC);
