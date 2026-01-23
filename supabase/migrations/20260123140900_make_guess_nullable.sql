-- Make guess_latitude, guess_longitude, and score nullable in game_round_players

-- Drop the NOT NULL constraints
ALTER TABLE public.game_round_players 
    ALTER COLUMN guess_latitude DROP NOT NULL,
    ALTER COLUMN guess_longitude DROP NOT NULL,
    ALTER COLUMN score DROP NOT NULL;

-- Update the default for score to remain 0 when null
ALTER TABLE public.game_round_players 
    ALTER COLUMN score SET DEFAULT 0;
