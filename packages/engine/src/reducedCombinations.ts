export interface PlayerMatchState {
  playerId: string;
  shownHighCombosCount: number;
}

export interface DeclaredCombo {
  points: number;
  name: string;
}

export interface CombinationFilterResult {
  allowedCombos: DeclaredCombo[];
  updatedCount: number;
}

/**
 * Enforces the v2.4 match-wide limit for high combinations.
 * A double high-combination in the same deal is indivisible: when one slot
 * has already been used, both are accepted and the counter becomes three.
 */
export function filterAllowedCombinations(
  playerState: PlayerMatchState,
  declaredCombos: DeclaredCombo[],
  hasTrick: boolean
): CombinationFilterResult {
  if (!Number.isInteger(playerState.shownHighCombosCount) || playerState.shownHighCombosCount < 0) {
    throw new RangeError("shownHighCombosCount must be a non-negative integer");
  }
  if (declaredCombos.some((combo) => !Number.isFinite(combo.points) || combo.points < 0)) {
    throw new RangeError("Combination points must be finite and non-negative");
  }
  if (!hasTrick) {
    return { allowedCombos: [], updatedCount: playerState.shownHighCombosCount };
  }

  const highCombos = declaredCombos.filter((combo) => combo.points >= 100);
  const lowCombos = declaredCombos.filter((combo) => combo.points < 100);
  const current = playerState.shownHighCombosCount;

  if (highCombos.length === 0 || current >= 2) {
    return { allowedCombos: lowCombos, updatedCount: current };
  }
  if (highCombos.length === 1) {
    return { allowedCombos: [...lowCombos, highCombos[0]], updatedCount: current + 1 };
  }
  if (current === 0) {
    return { allowedCombos: [...lowCombos, ...highCombos], updatedCount: 2 };
  }
  if (current === 1) {
    return { allowedCombos: [...lowCombos, ...highCombos], updatedCount: 3 };
  }
  return { allowedCombos: lowCombos, updatedCount: current };
}
