CREATE TABLE public.advice_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service text NOT NULL,
  region text,
  crop text,
  mandi text,
  recommendation text,
  decision_id text,
  useful boolean NOT NULL,
  lang text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.advice_feedback TO anon;
GRANT SELECT, INSERT ON public.advice_feedback TO authenticated;
GRANT ALL ON public.advice_feedback TO service_role;

ALTER TABLE public.advice_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can add feedback"
  ON public.advice_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read feedback"
  ON public.advice_feedback FOR SELECT
  TO anon, authenticated
  USING (true);