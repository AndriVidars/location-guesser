-- Enable realtime for game tables
alter publication supabase_realtime add table games;
alter publication supabase_realtime add table game_players;
alter publication supabase_realtime add table game_rounds;
alter publication supabase_realtime add table game_round_players;
