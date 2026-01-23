import type { Game, GameRoundPlayer } from "../types/game";

export function generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const MAX_POINTS = 100;

// Map configuration: continent code -> (max_dist, k)
const scoreConfig: Record<string, { maxDist: number; k: number }> = {
    'WORLD': { maxDist: Math.sqrt(149_000_000), k: 7.5e-4 },
    'EU': { maxDist: Math.sqrt(10_180_000), k: 1.5e-3 },
    'AS': { maxDist: Math.sqrt(44_579_000), k: 6e-4 },
    'AF': { maxDist: Math.sqrt(30_200_000), k: 5e-4 },
    'NA': { maxDist: Math.sqrt(24_290_000), k: 8e-4 },
    'SA': { maxDist: Math.sqrt(17_840_000), k: 7.5e-4 },
    'OC': { maxDist: Math.sqrt(8_520_000), k: 5e-4 },
    'AN': { maxDist: Math.sqrt(14_200_000), k: 1e-3 },
};

function getScoreConfig(continentCode: string | null): { maxDist: number; k: number } {
    if (!continentCode) return scoreConfig['WORLD'];
    return scoreConfig[continentCode] || scoreConfig['WORLD'];
}

/**
 * Calculate score based on distance using exponential decay formula
 * @param dist - Distance in km between guess and actual location
 * @param maxDist - Maximum distance for the map
 * @param k - Decay constant
 * @returns Score (0-100)
 */
function score(dist: number, maxDist: number, k: number): number {
    const numerator = Math.exp(-dist * k) - Math.exp(-maxDist * k);
    const denominator = 1 - Math.exp(-maxDist * k);
    // so that -0 not affected
    return Math.max(0, Math.round(MAX_POINTS * (numerator / denominator)));
}

export function calculateScore(game: Game, distance: number): number {
    const config = getScoreConfig(game.continent_code);
    return score(distance, config.maxDist, config.k);
}

