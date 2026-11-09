export interface PlayerRoundResult {
  id: string;
  rawPoints: number;
  hasTrick: boolean;
}

export interface RoundScore3P {
  bile: Record<string, number>;
  isBT: boolean;
  isDraw: boolean;
  log: string;
}

export function pointsToBile(points: number): number {
  if (!Number.isFinite(points) || points < 0) {
    throw new RangeError("Points must be a finite, non-negative number");
  }
  const base = Math.floor(points / 10);
  return points % 10 >= 6 ? base + 1 : base;
}

/**
 * belot.md 3-player residual scoring.
 * Passive players receive their rounded bile first; the maker receives the remainder.
 * BT is judged on bile, then on raw points against the strongest passive player(s).
 */
export function calculateRound3Players(
  makerId: string,
  players: [PlayerRoundResult, PlayerRoundResult, PlayerRoundResult]
): RoundScore3P {
  if (new Set(players.map((player) => player.id)).size !== 3) {
    throw new Error("A 3-player round requires three unique player IDs");
  }
  if (!players.some((player) => player.id === makerId)) {
    throw new Error("The maker must be one of the three players");
  }
  for (const player of players) {
    if (!Number.isFinite(player.rawPoints) || player.rawPoints < 0) {
      throw new RangeError(`Invalid raw points for player ${player.id}`);
    }
  }

  const maker = players.find((player) => player.id === makerId)!;
  const defenders = players.filter((player) => player.id !== makerId);
  const [d1, d2] = defenders;
  const bileD1 = pointsToBile(d1.rawPoints);
  const bileD2 = pointsToBile(d2.rawPoints);
  const totalBile = pointsToBile(players.reduce((sum, player) => sum + player.rawPoints, 0));
  const bileMaker = totalBile - bileD1 - bileD2;
  const maxDefenderBile = Math.max(bileD1, bileD2);
  const strongestDefenders = defenders.filter((player) => pointsToBile(player.rawPoints) === maxDefenderBile);
  const maxDefenderRaw = Math.max(...strongestDefenders.map((player) => player.rawPoints));

  const defenderAwards = { [d1.id]: bileD1, [d2.id]: bileD2 };
  if (bileMaker < maxDefenderBile) {
    return {
      bile: { [maker.id]: 0, ...defenderAwards },
      isBT: true,
      isDraw: false,
      log: `BT la bile: maker ${bileMaker} < defender ${maxDefenderBile}`
    };
  }

  if (bileMaker === maxDefenderBile) {
    if (maker.rawPoints < maxDefenderRaw) {
      return {
        bile: { [maker.id]: 0, ...defenderAwards },
        isBT: true,
        isDraw: false,
        log: `BT la egalitate de bile: ${maker.rawPoints} < ${maxDefenderRaw} puncte brute`
      };
    }
    if (maker.rawPoints === maxDefenderRaw) {
      return {
        bile: { [maker.id]: bileMaker, ...defenderAwards },
        isBT: false,
        isDraw: true,
        log: "Egalitate completă la bile și puncte brute"
      };
    }
  }

  return {
    bile: { [maker.id]: bileMaker, ...defenderAwards },
    isBT: false,
    isDraw: false,
    log: `Joc realizat: ${bileMaker} bile din ${totalBile}`
  };
}
