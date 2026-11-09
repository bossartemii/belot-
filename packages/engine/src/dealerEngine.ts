import type { Card, Seat, Suit } from "./index";
import { makeDeck } from "./index";

export type DealerMode = "1v1" | "3p" | "2v2";
export type BiddingRound = 1 | 2;

export interface InitialDeal {
  hands: Record<number, Card[]>;
  turnUpCard: Card;
  remainingDeck: Card[];
  playerCount: number;
  dealerSeat: number;
}

export interface CompletedDeal {
  hands: Record<number, Card[]>;
  remainingDeck: Card[];
  turnUpCardInPlay: boolean;
}

/** belot.md cut convention: the first K cards move to the bottom; timeout means K=1. */
export function applyCut(deck: readonly Card[], cutIndex?: number | null): Card[] {
  if (deck.length < 2) throw new RangeError("A deck must contain at least two cards");
  const cut = cutIndex == null ? 1 : cutIndex;
  if (!Number.isInteger(cut) || cut < 1 || cut >= deck.length) {
    throw new RangeError(`cutIndex must be an integer from 1 to ${deck.length - 1}`);
  }
  return [...deck.slice(cut), ...deck.slice(0, cut)];
}

function validateTable(playerCount: number, dealerSeat: number): void {
  if (![2, 3, 4].includes(playerCount)) throw new RangeError("playerCount must be 2, 3 or 4");
  if (!Number.isInteger(dealerSeat) || dealerSeat < 0 || dealerSeat >= playerCount) {
    throw new RangeError("dealerSeat is outside the table");
  }
}

function clockwiseSeats(playerCount: number, dealerSeat: number): number[] {
  return Array.from({ length: playerCount }, (_, offset) => (dealerSeat + 1 + offset) % playerCount);
}

/** Initial packet: 6 cards/player at heads-up, 5 cards/player at 3p/4p, then turn-up. */
export function dealInitialPhase(
  cutDeck: readonly Card[],
  playerCount: number,
  dealerSeat: number
): InitialDeal {
  validateTable(playerCount, dealerSeat);
  const expectedDeckSize = playerCount === 4 ? 32 : 24;
  if (cutDeck.length !== expectedDeckSize) throw new Error(`Expected a ${expectedDeckSize}-card deck`);
  const cardsPerPlayer = playerCount === 2 ? 6 : 5;
  const required = playerCount * cardsPerPlayer + 1;
  if (cutDeck.length < required) throw new Error("Not enough cards for the initial deal");
  const hands: Record<number, Card[]> = Object.fromEntries(
    Array.from({ length: playerCount }, (_, seat) => [seat, []])
  );
  let cursor = 0;
  const order = clockwiseSeats(playerCount, dealerSeat);
  // Deal in packets of 3 then 3 (1v1), or 3 then 2 (3p/4p), clockwise.
  const packetSizes = playerCount === 2 ? [3, 3] : [3, 2];
  for (const packetSize of packetSizes) {
    for (const seat of order) {
      for (let n = 0; n < packetSize; n++) hands[seat].push(cutDeck[cursor++]);
    }
  }
  const turnUpCard = cutDeck[cursor++];
  return {
    hands,
    turnUpCard,
    remainingDeck: cutDeck.slice(cursor),
    playerCount,
    dealerSeat
  };
}

/**
 * Complete the deal after bidding.
 * For 3p/4p the stock distribution is maker=2, every other player=3, plus the turn-up
 * to the maker in round 1 or dealer in round 2. This is the only 32/24-card-safe
 * distribution matching the already implemented 2+3 rule.
 *
 * Heads-up round 2 removes the turn-up card from play; both players receive 3 stock cards.
 * Heads-up round 1 is deliberately rejected pending an authoritative ruling on who receives
 * the turn-up card, because adding it to a 9-card hand contradicts the stated 6+3 hand size.
 */
export function completeDeal(
  initial: InitialDeal,
  makerSeat: number,
  biddingRound: BiddingRound
): CompletedDeal {
  const { playerCount, dealerSeat, turnUpCard } = initial;
  validateTable(playerCount, dealerSeat);
  if (!Number.isInteger(makerSeat) || makerSeat < 0 || makerSeat >= playerCount) {
    throw new RangeError("makerSeat is outside the table");
  }
  if (playerCount === 2 && biddingRound === 1) {
    throw new Error("1v1 round-1 turn-up ownership is ambiguous in the supplied specification");
  }

  const hands: Record<number, Card[]> = Object.fromEntries(
    Object.entries(initial.hands).map(([seat, hand]) => [Number(seat), [...hand]])
  );
  const order = clockwiseSeats(playerCount, dealerSeat);
  let cursor = 0;
  for (const seat of order) {
    const stockCount = seat === makerSeat ? 2 : 3;
    for (let n = 0; n < stockCount; n++) {
      const card = initial.remainingDeck[cursor++];
      if (!card) throw new Error("Stock exhausted: distribution is inconsistent with deck size");
      hands[seat].push(card);
    }
  }

  let turnUpCardInPlay = true;
  if (playerCount === 2 && biddingRound === 2) {
    turnUpCardInPlay = false;
  } else {
    const recipient = biddingRound === 1 ? makerSeat : dealerSeat;
    hands[recipient].push(turnUpCard);
  }

  return { hands, remainingDeck: initial.remainingDeck.slice(cursor), turnUpCardInPlay };
}

/** Swap the trump seven with the exposed card; valid only for 4p, first-round contract. */
export function swapSevenOfTrump(
  hand: readonly Card[],
  turnUpCard: Card,
  trumpSuit: Suit,
  playerCount: number,
  biddingRound: BiddingRound
): { hand: Card[]; turnUpCard: Card; swapped: boolean } {
  if (playerCount !== 4 || biddingRound !== 1) {
    return { hand: [...hand], turnUpCard, swapped: false };
  }
  const index = hand.findIndex((card) => card.suit === trumpSuit && card.rank === "7");
  if (index < 0) return { hand: [...hand], turnUpCard, swapped: false };
  const nextHand = [...hand];
  const seven = nextHand[index];
  nextHand[index] = turnUpCard;
  return { hand: nextHand, turnUpCard: seven, swapped: true };
}
