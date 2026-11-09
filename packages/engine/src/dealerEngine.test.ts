import { describe, expect, it } from "vitest";
import { makeDeck } from "./index";
import { applyCut, dealInitialPhase, completeDeal, swapSevenOfTrump } from "./dealerEngine";

describe("dealer engine", () => {
  it("moves the first card to the bottom for the timeout fallback", () => {
    const deck = makeDeck();
    const cut = applyCut(deck);
    expect(cut[cut.length - 1]).toEqual(deck[0]);
    expect(cut[0]).toEqual(deck[1]);
  });

  it("applies an explicit cut index as a left rotation", () => {
    const deck = makeDeck();
    expect(applyCut(deck, 14)).toEqual([...deck.slice(14), ...deck.slice(0, 14)]);
  });

  it("deals 5 cards in 3+2 packets from the seat left of dealer", () => {
    const deck = makeDeck();
    const result = dealInitialPhase(deck, 4, 0);
    expect(result.hands[1]).toHaveLength(5);
    expect(result.hands[2]).toHaveLength(5);
    expect(result.hands[3]).toHaveLength(5);
    expect(result.hands[0]).toHaveLength(5);
    expect(result.turnUpCard).toEqual(deck[20]);
  });

  it("deals 6 cards per player in heads-up mode", () => {
    const result = dealInitialPhase(makeDeck().filter(c => c.rank !== "7" && c.rank !== "8"), 2, 0);
    expect(result.hands[1]).toHaveLength(6);
    expect(result.hands[0]).toHaveLength(6);
  });

  it("swaps the trump seven only in 4-player round one", () => {
    const hand = [{ suit: "spades", rank: "7", id: "spades-7" } as const];
    const up = { suit: "hearts", rank: "A", id: "hearts-A" } as const;
    const result = swapSevenOfTrump(hand, up, "spades", 4, 1);
    expect(result.swapped).toBe(true);
    expect(result.hand[0]).toEqual(up);
    expect(result.turnUpCard).toEqual(hand[0]);
    expect(swapSevenOfTrump(hand, up, "spades", 3, 1).swapped).toBe(false);
  });

  it("rejects the contradictory 1v1 round-one turn-up rule instead of inventing a 10th card", () => {
    const deck24 = makeDeck().filter(c => c.rank !== "7" && c.rank !== "8");
    const initial = dealInitialPhase(deck24, 2, 0);
    expect(() => completeDeal(initial, 1, 1)).toThrow(/ambiguous/);
  });
});
