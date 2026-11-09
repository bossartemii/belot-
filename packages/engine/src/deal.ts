import {
  makeDeck, seededRandom, shuffle, legalCards, trickWinner, cardPoints,
  type Card, type Suit, type Seat, type PlayedCard
} from "./index";

export type TeamId = 0 | 1;
export type DealPhase = "BIDDING_ROUND_1" | "BIDDING_ROUND_2" | "DECLARATIONS" | "TRICK_PLAY" | "TRICK_SETTLED" | "RESOLVED" | "REDEAL";
export type AnnouncementType = "TERT" | "CINCIZECI" | "O_SUTA" | "CAREU";
export type Announcement = Readonly<{
  id: string; player: Seat; team: TeamId; type: AnnouncementType;
  rank: Card["rank"]; suit?: Suit; points: number;
}>;
export type RoundOutcome = "FAIT" | "CHUTE" | "ATARNAT" | "REDEAL";
export type DealState = Readonly<{
  phase: DealPhase; dealer: Seat; currentPlayer: Seat; deck: readonly Card[];
  hands: Readonly<Record<Seat, readonly Card[]>>; upCard: Card | null;
  trumpSuit: Suit | null; declarer: Seat | null; declarerTeam: TeamId | null;
  biddingPasses: number; declaredAnnouncements: readonly Announcement[];
  validatedAnnouncements: readonly Announcement[]; belotPlayers: readonly Seat[]; belotPendingPlayers: readonly Seat[];
  currentTrick: readonly PlayedCard[]; settledWinner: Seat | null; completedTricksCount: number;
  tricksWon: Readonly<Record<TeamId, number>>;
  capturedCards: Readonly<Record<TeamId, readonly Card[]>>;
  lastTrickWinner: Seat | null; suspendedPoints: number;
  roundScore: Readonly<{
    team0: number; team1: number; pointsAwardedToTeam0: number; pointsAwardedToTeam1: number;
    newSuspendedPoints: number; outcome: RoundOutcome; isCapot: boolean;
  }> | null;
}>;
export type DealAction =
  | Readonly<{ type: "PASS" }>
  | Readonly<{ type: "TAKE_UPCARD" }>
  | Readonly<{ type: "BID_SUIT"; suit: Suit }>
  | Readonly<{ type: "CONFIRM_DECLARATIONS" }>
  | Readonly<{ type: "PLAY_CARD"; cardId: Card["id"] }>;

export const teamOf = (seat: Seat): TeamId => seat % 2 === 0 ? 0 : 1;
export const nextSeat = (seat: Seat): Seat => ((seat + 1) % 4) as Seat;
const emptyHands = (): Record<Seat, Card[]> => ({ 0: [], 1: [], 2: [], 3: [] });
const rankOrder: Card["rank"][] = ["7","8","9","10","J","Q","K","A"];
const careuPower: Record<Card["rank"], number> = { "7": 0, "8": 0, "9": 1500, "10": 1003, J: 2000, Q: 1001, K: 1002, A: 1004 };

function compareAnnouncement(a: Announcement, b: Announcement, trump: Suit): number {
  const ac = a.type === "CAREU", bc = b.type === "CAREU";
  if (ac !== bc) return ac ? 1 : -1;
  if (ac) return careuPower[a.rank] - careuPower[b.rank];
  if (a.points !== b.points) return a.points - b.points;
  const rankDiff = rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
  if (rankDiff) return rankDiff;
  return Number(a.suit === trump) - Number(b.suit === trump);
}

function detectAnnouncements(hands: Readonly<Record<Seat, readonly Card[]>>, trump: Suit) {
  const found: Announcement[] = [];
    for (const seat of [0,1,2,3] as Seat[]) {
    const hand = hands[seat];
    for (const suit of ["clubs","diamonds","hearts","spades"] as Suit[]) {
      const ranks = new Set(hand.filter(c => c.suit === suit).map(c => c.rank));
      let i = 0;
      while (i < rankOrder.length) {
        if (!ranks.has(rankOrder[i])) { i++; continue; }
        let j = i;
        while (j + 1 < rankOrder.length && ranks.has(rankOrder[j + 1])) j++;
        const length = j - i + 1;
        if (length >= 3) {
          const type: AnnouncementType = length >= 5 ? "O_SUTA" : length === 4 ? "CINCIZECI" : "TERT";
          found.push({ id: `seq-${seat}-${suit}-${i}`, player: seat, team: teamOf(seat), type, rank: rankOrder[j], suit, points: length >= 5 ? 100 : length === 4 ? 50 : 20 });
        }
        i = j + 1;
      }
    }
    for (const rank of rankOrder) {
      if (hand.filter(c => c.rank === rank).length === 4) {
        const points = rank === "J" ? 200 : rank === "9" ? 150 : ["A","10","K","Q"].includes(rank) ? 100 : 0;
        if (points > 0) found.push({ id: `careu-${seat}-${rank}`, player: seat, team: teamOf(seat), type: "CAREU", rank, points });
      }
    }
  }
  return { found };
}

function validateAnnouncements(items: readonly Announcement[], trump: Suit): Announcement[] {
  const t0 = items.filter(a => a.team === 0), t1 = items.filter(a => a.team === 1);
  if (!t0.length) return [...t1];
  if (!t1.length) return [...t0];
  const best = (xs: readonly Announcement[]) => xs.reduce((a,b) => compareAnnouncement(b,a,trump) > 0 ? b : a);
  const cmp = compareAnnouncement(best(t0), best(t1), trump);
  return cmp > 0 ? [...t0] : cmp < 0 ? [...t1] : [];
}

export function createDeal(seed: number, dealer: Seat, suspendedPoints = 0): DealState {
  const deck = shuffle(makeDeck(), seededRandom(seed));
  const hands = emptyHands();
  let cursor = 0;
  for (let block = 0; block < 2; block++) {
    const count = block === 0 ? 3 : 2;
    for (let n = 0; n < count; n++) {
      for (const seat of [nextSeat(dealer), nextSeat(nextSeat(dealer)), nextSeat(nextSeat(nextSeat(dealer))), dealer] as Seat[]) {
        hands[seat].push(deck[cursor++]);
      }
    }
  }
  const upCard = deck[cursor++];
  return {
    phase: "BIDDING_ROUND_1", dealer, currentPlayer: nextSeat(dealer), deck: deck.slice(cursor),
    hands, upCard, trumpSuit: null, declarer: null, declarerTeam: null, biddingPasses: 0,
    declaredAnnouncements: [], validatedAnnouncements: [], belotPlayers: [], belotPendingPlayers: [],
    currentTrick: [], settledWinner: null, completedTricksCount: 0, tricksWon: { 0: 0, 1: 0 },
    capturedCards: { 0: [], 1: [] }, lastTrickWinner: null, suspendedPoints,
    roundScore: null
  };
}

function finishBidding(state: DealState, player: Seat, trump: Suit): DealState {
  const hands = { 0: [...state.hands[0]], 1: [...state.hands[1]], 2: [...state.hands[2]], 3: [...state.hands[3]] };
  // The turned-up card belongs to the player who accepts/calls trump.
  if (state.upCard) hands[player].push(state.upCard);
  // A 32-card deck cannot support 3 extra cards for all four players after the upcard:
  // the taker receives 2 from the stock, the other three players receive 3 each.
  let cursor = 0;
  for (const seat of [nextSeat(state.dealer), nextSeat(nextSeat(state.dealer)), nextSeat(nextSeat(nextSeat(state.dealer))), state.dealer] as Seat[]) {
    const count = seat === player ? 2 : 3;
    for (let n = 0; n < count; n++) {
      const card = state.deck[cursor++];
      if (card) hands[seat].push(card);
    }
  }
  const rest = state.deck.slice(cursor);
  const found = detectAnnouncements(hands, trump);
  return {
    ...state, phase: "DECLARATIONS", currentPlayer: nextSeat(state.dealer), deck: rest, hands,
    trumpSuit: trump, declarer: player, declarerTeam: teamOf(player),
    declaredAnnouncements: found.found, validatedAnnouncements: validateAnnouncements(found.found, trump),
    belotPlayers: [], belotPendingPlayers: [], biddingPasses: 0
  };
}

function resolve(state: DealState): DealState {
  if (state.declarerTeam === null || state.trumpSuit === null) return state;
  const trump = state.trumpSuit, declarer = state.declarerTeam, defender: TeamId = declarer === 0 ? 1 : 0;
  const cardScores: Record<TeamId, number> = { 0: 0, 1: 0 };
  for (const team of [0,1] as TeamId[]) cardScores[team] = state.capturedCards[team].reduce((sum,c) => sum + cardPoints(c,trump),0);
  const lastTeam = state.lastTrickWinner === null ? 0 : teamOf(state.lastTrickWinner);
  cardScores[lastTeam] += 10;
  const isCapot = state.tricksWon[0] === 8 || state.tricksWon[1] === 8;
  const capotTeam: TeamId | null = state.tricksWon[0] === 8 ? 0 : state.tricksWon[1] === 8 ? 1 : null;
  if (isCapot && capotTeam !== null) {
    cardScores[capotTeam] = 250;
    cardScores[capotTeam === 0 ? 1 : 0] = 0;
  }
  const ann: Record<TeamId, number> = { 0: 0, 1: 0 };
  for (const a of state.validatedAnnouncements) ann[a.team] += a.points;
  for (const p of state.belotPlayers) ann[teamOf(p)] += 20;
  const total0 = cardScores[0] + ann[0], total1 = cardScores[1] + ann[1];
  const totalDec = cardScores[declarer] + ann[declarer], totalDef = cardScores[defender] + ann[defender];
  const allDeclared: Record<TeamId, number> = { 0: 0, 1: 0 };
  for (const a of state.declaredAnnouncements) allDeclared[a.team] += a.points;
  for (const p of state.belotPlayers) allDeclared[teamOf(p)] += 20;
  const fullPot = cardScores[0] + cardScores[1] + allDeclared[0] + allDeclared[1];
  let outcome: RoundOutcome, award0 = 0, award1 = 0, suspended = state.suspendedPoints;
  const give = (team: TeamId, points: number) => { if (team === 0) award0 = points; else award1 = points; };
  if (isCapot && capotTeam === defender) {
    outcome = "CHUTE"; give(defender, fullPot + suspended); suspended = 0;
  } else if (isCapot && capotTeam === declarer) {
    outcome = "FAIT"; give(declarer, totalDec + suspended); give(defender, ann[defender]); suspended = 0;
  } else if (totalDec > totalDef) {
    outcome = "FAIT"; give(declarer, totalDec + suspended); give(defender, totalDef); suspended = 0;
  } else if (totalDec < totalDef) {
    outcome = "CHUTE"; give(defender, fullPot + suspended); suspended = 0;
  } else {
    outcome = "ATARNAT"; give(defender, totalDef); suspended += totalDec;
  }
  return { ...state, phase: "RESOLVED", suspendedPoints: suspended, roundScore: {
    team0: total0, team1: total1, pointsAwardedToTeam0: award0, pointsAwardedToTeam1: award1,
    newSuspendedPoints: suspended, outcome, isCapot
  }};
}

/** Pure state transition. Invalid actions leave the original state untouched. */
export function reduceDeal(state: DealState, action: DealAction): DealState {
  if (state.phase === "BIDDING_ROUND_1") {
    if (action.type === "TAKE_UPCARD" && state.upCard) return finishBidding(state, state.currentPlayer, state.upCard.suit);
    if (action.type !== "PASS") return state;
    const passes = state.biddingPasses + 1;
    return passes === 4
      ? { ...state, phase: "BIDDING_ROUND_2", currentPlayer: nextSeat(state.dealer), biddingPasses: 0 }
      : { ...state, currentPlayer: nextSeat(state.currentPlayer), biddingPasses: passes };
  }
  if (state.phase === "BIDDING_ROUND_2") {
    if (action.type === "BID_SUIT" && state.upCard && action.suit !== state.upCard.suit)
      return finishBidding(state, state.currentPlayer, action.suit);
    if (action.type !== "PASS") return state;
    const passes = state.biddingPasses + 1;
    return passes === 4
      ? { ...state, phase: "REDEAL", currentPlayer: nextSeat(state.dealer), biddingPasses: passes }
      : { ...state, currentPlayer: nextSeat(state.currentPlayer), biddingPasses: passes };
  }
  if (state.phase === "DECLARATIONS") {
    if (action.type !== "CONFIRM_DECLARATIONS") return state;
    return { ...state, phase: "TRICK_PLAY", currentPlayer: nextSeat(state.dealer) };
  }
  if (state.phase === "TRICK_SETTLED" && action.type === "ADVANCE_TRICK" && state.settledWinner !== null) {
    const winner = state.settledWinner;
    const team = teamOf(winner);
    const cards = state.currentTrick.map(p => p.card);
    const capturedCards = { ...state.capturedCards, [team]: [...state.capturedCards[team], ...cards] };
    const tricksWon = { ...state.tricksWon, [team]: state.tricksWon[team] + 1 };
    const completed = state.completedTricksCount + 1;
    const next: DealState = {
      ...state, phase: "TRICK_PLAY", currentTrick: [], settledWinner: null,
      currentPlayer: winner, capturedCards, tricksWon, completedTricksCount: completed,
      lastTrickWinner: winner
    };
    return completed === 8 ? resolve(next) : next;
  }
  if (state.phase === "TRICK_PLAY" && action.type === "PLAY_CARD" && state.trumpSuit) {
    const hand = state.hands[state.currentPlayer];
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;
    const legal = legalCards(hand, state.currentTrick, state.trumpSuit);
    if (!legal.some(c => c.id === card.id)) return state;
    const hands = { ...state.hands, [state.currentPlayer]: hand.filter(c => c.id !== card.id) };
    let belotPendingPlayers = [...state.belotPendingPlayers];
    let belotPlayers = [...state.belotPlayers];
    if (card.suit === state.trumpSuit && (card.rank === "K" || card.rank === "Q")) {
      if (belotPendingPlayers.includes(state.currentPlayer)) {
        belotPendingPlayers = belotPendingPlayers.filter(p => p !== state.currentPlayer);
        if (!belotPlayers.includes(state.currentPlayer)) belotPlayers.push(state.currentPlayer);
      } else if (hand.some(c => c.suit === state.trumpSuit && c.rank === "K") &&
                 hand.some(c => c.suit === state.trumpSuit && c.rank === "Q")) {
        belotPendingPlayers.push(state.currentPlayer);
      }
    }
    const played = [...state.currentTrick, { seat: state.currentPlayer, card }];
    if (played.length < 4) return { ...state, hands, belotPendingPlayers, belotPlayers, currentTrick: played, currentPlayer: nextSeat(state.currentPlayer) };
    const winner = trickWinner(played, state.trumpSuit);
    return {
      ...state, phase: "TRICK_SETTLED", hands, belotPendingPlayers, belotPlayers,
      currentTrick: played, currentPlayer: winner, settledWinner: winner
    };
  }
  return state;
}
