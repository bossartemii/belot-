export const SUITS = ["clubs", "diamonds", "hearts", "spades"] as const;
export type Suit = (typeof SUITS)[number];
export const RANKS = ["7", "8", "9", "10", "J", "Q", "K", "A"] as const;
export type Rank = (typeof RANKS)[number];
export type Card = Readonly<{ suit: Suit; rank: Rank; id: `${Suit}-${Rank}` }>;
export type Seat = 0 | 1 | 2 | 3;
export type PlayedCard = Readonly<{ seat: Seat; card: Card }>;

export const makeDeck = (): Card[] => SUITS.flatMap((suit) => RANKS.map((rank) => ({
  suit, rank, id: `${suit}-${rank}` as const
})));

/** Mulberry32: reproducible PRNG for tests/replays. Never accept a client-provided seed in production. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function deal(seed?: number): Card[][] {
  const deck = shuffle(makeDeck(), seed === undefined ? Math.random : seededRandom(seed));
  return Array.from({ length: 4 }, (_, seat) => deck.slice(seat * 8, seat * 8 + 8));
}

const TRUMP_ORDER: Rank[] = ["7", "8", "Q", "K", "10", "A", "9", "J"];
const PLAIN_ORDER: Rank[] = ["7", "8", "9", "J", "Q", "K", "10", "A"];
const TRUMP_POINTS: Record<Rank, number> = { "7": 0, "8": 0, "9": 14, "10": 10, J: 20, Q: 3, K: 4, A: 11 };
const PLAIN_POINTS: Record<Rank, number> = { "7": 0, "8": 0, "9": 0, "10": 10, J: 2, Q: 3, K: 4, A: 11 };

export function cardPoints(card: Card, trump: Suit): number {
  return card.suit === trump ? TRUMP_POINTS[card.rank] : PLAIN_POINTS[card.rank];
}

function strength(card: Card, trump: Suit): number {
  const order = card.suit === trump ? TRUMP_ORDER : PLAIN_ORDER;
  return order.indexOf(card.rank);
}

function provisionalWinner(trick: readonly PlayedCard[], trump: Suit): Seat {
  const lead = trick[0].card.suit;
  return [...trick].sort((a, b) => {
    const at = a.card.suit === trump, bt = b.card.suit === trump;
    if (at !== bt) return at ? -1 : 1;
    if (a.card.suit !== b.card.suit) {
      if (a.card.suit === lead) return -1;
      if (b.card.suit === lead) return 1;
      return 0;
    }
    return strength(b.card, trump) - strength(a.card, trump);
  })[0].seat;
}

export function legalCards(hand: readonly Card[], trick: readonly PlayedCard[], trump: Suit): Card[] {
  if (trick.length === 0) return [...hand];
  const leadSuit = trick[0].card.suit;
  const sameSuit = hand.filter((c) => c.suit === leadSuit);
  if (sameSuit.length > 0) {
    if (leadSuit === trump) {
      const highestTrump = trick.filter((p) => p.card.suit === trump)
        .sort((a, b) => strength(b.card, trump) - strength(a.card, trump))[0];
      if (highestTrump) {
        const higher = sameSuit.filter((c) => strength(c, trump) > strength(highestTrump.card, trump));
        if (higher.length > 0) return higher;
      }
    }
    return sameSuit;
  }

  const trumps = hand.filter((c) => c.suit === trump);
  if (trumps.length === 0) return [...hand];

  // Trump was led: partner exemption never applies; all players must follow trump and overtrump.
  if (leadSuit === trump) {
    const highestTrump = trick.filter((p) => p.card.suit === trump)
      .sort((a, b) => strength(b.card, trump) - strength(a.card, trump))[0];
    const higher = highestTrump ? trumps.filter((c) => strength(c, trump) > strength(highestTrump.card, trump)) : [];
    return higher.length > 0 ? higher : trumps;
  }

  // On a plain-suit lead, a partner currently winning removes both cut and overcut obligations.
  const winner = provisionalWinner(trick, trump);
  const actingSeat = ((trick[trick.length - 1].seat + 1) % 4) as Seat;
  if (winner % 2 === actingSeat % 2) return [...hand];

  const highestTrump = trick.filter((p) => p.card.suit === trump)
    .sort((a, b) => strength(b.card, trump) - strength(a.card, trump))[0];
  if (highestTrump) {
    const higher = trumps.filter((c) => strength(c, trump) > strength(highestTrump.card, trump));
    if (higher.length > 0) return higher;
  }
  return trumps;
}

export function trickWinner(trick: readonly PlayedCard[], trump: Suit): Seat {
  if (trick.length !== 4) throw new Error("A trick must contain exactly four cards");
  const lead = trick[0].card.suit;
  const winning = [...trick].sort((a, b) => {
    const aTrump = a.card.suit === trump, bTrump = b.card.suit === trump;
    if (aTrump !== bTrump) return aTrump ? -1 : 1;
    if (a.card.suit !== b.card.suit) {
      if (a.card.suit === lead) return -1;
      if (b.card.suit === lead) return 1;
      return 0;
    }
    return strength(b.card, trump) - strength(a.card, trump);
  })[0];
  return winning.seat;
}

export function trickPoints(trick: readonly PlayedCard[], trump: Suit, lastTrickBonus = 10): number {
  if (trick.length !== 4) throw new Error("A trick must contain exactly four cards");
  return trick.reduce((sum, p) => sum + cardPoints(p.card, trump), 0) + lastTrickBonus;
}
