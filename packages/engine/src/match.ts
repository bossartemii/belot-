import { createDeal, reduceDeal, type DealAction, type DealState, type Seat, type TeamId } from "./deal";

export type MatchTarget = 501 | 1001;
export type MatchState = Readonly<{
  target: MatchTarget;
  dealer: Seat;
  seed: number;
  teamScores: Readonly<Record<TeamId, number>>;
  suspendedPoints: number;
  activeDeal: DealState;
  completedDeals: number;
  winner: TeamId | null;
  lastResolvedDeal: DealState | null;
}>;

export function createMatch(seed: number, dealer: Seat, target: MatchTarget): MatchState {
  return {
    target,
    dealer,
    seed,
    teamScores: { 0: 0, 1: 0 },
    suspendedPoints: 0,
    activeDeal: createDeal(seed, dealer),
    completedDeals: 0,
    winner: null,
    lastResolvedDeal: null
  };
}

function winnerAtTarget(scores: Readonly<Record<TeamId, number>>, target: MatchTarget): TeamId | null {
  const reached0 = scores[0] >= target;
  const reached1 = scores[1] >= target;
  if (reached0 && reached1) {
    if (scores[0] === scores[1]) return null;
    return scores[0] > scores[1] ? 0 : 1;
  }
  if (reached0) return 0;
  if (reached1) return 1;
  return null;
}

/**
 * Applies one authoritative deal action. A completed deal is banked exactly once;
 * the next deal is then created with the next dealer and the carried Atârnat buffer.
 * A redeal rotates the dealer but never changes scores or suspended points.
 */
export function reduceMatch(state: MatchState, action: DealAction): MatchState {
  if (state.winner !== null) return state;

  const nextDeal = reduceDeal(state.activeDeal, action);
  if (nextDeal === state.activeDeal) return state;

  if (nextDeal.phase === "REDEAL") {
    const dealer = ((state.dealer + 1) % 4) as Seat;
    const seed = state.seed + 1;
    return {
      ...state,
      dealer,
      seed,
      activeDeal: createDeal(seed, dealer, state.suspendedPoints),
      completedDeals: state.completedDeals + 1,
      lastResolvedDeal: null
    };
  }

  if (nextDeal.phase !== "RESOLVED" || !nextDeal.roundScore) {
    return { ...state, activeDeal: nextDeal };
  }

  const scores = {
    0: state.teamScores[0] + nextDeal.roundScore.pointsAwardedToTeam0,
    1: state.teamScores[1] + nextDeal.roundScore.pointsAwardedToTeam1
  };
  const winner = winnerAtTarget(scores, state.target);
  if (winner !== null) {
    return {
      ...state,
      teamScores: scores,
      suspendedPoints: nextDeal.suspendedPoints,
      activeDeal: nextDeal,
      completedDeals: state.completedDeals + 1,
      winner,
      lastResolvedDeal: nextDeal
    };
  }

  const dealer = ((state.dealer + 1) % 4) as Seat;
  const seed = state.seed + 1;
  return {
    ...state,
    dealer,
    seed,
    teamScores: scores,
    suspendedPoints: nextDeal.suspendedPoints,
    activeDeal: createDeal(seed, dealer, nextDeal.suspendedPoints),
    completedDeals: state.completedDeals + 1,
    lastResolvedDeal: nextDeal
  };
}
