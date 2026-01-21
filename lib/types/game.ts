export interface Game {
    id: string;
    created_at: string;
    invite_code: string;
    num_rounds: number;
    time_limit: number;
    continent_code: string | null;
    country_code: string | null;
    current_round: number;
    is_active: boolean;
}

export interface GamePlayer {
    game_id: string;
    player_id: string;
    name: string;
    is_host: boolean;
    score: number;
}

export interface GameRound {
    id: string;
    game_id: string;
    created_at: string;
    is_active: boolean;
    round_number: number;
    city_name: string;
    sampled_latitude: number;
    sampled_longitude: number;
    mapillary_image_id: string;
}

export interface GameRoundPlayer {
    game_round_id: string;
    player_id: string;
    guess_latitude: number;
    guess_longitude: number;
    score: number;
}
