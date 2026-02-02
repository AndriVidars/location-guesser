ALTER TABLE public.games DROP COLUMN game_has_started;
ALTER TABLE public.games ADD COLUMN has_started BOOLEAN DEFAULT FALSE;