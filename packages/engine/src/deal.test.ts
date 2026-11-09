import { describe, expect, it } from "vitest";
import { createDeal, reduceDeal } from "./deal";

describe("single-deal state machine", () => {
  it("deals five cards per player and an upcard from a 32-card deck", () => {
    const state = createDeal(123, 0);
    expect([0,1,2,3].map(p => state.hands[p as 0|1|2|3].length)).toEqual([5,5,5,5]);
    expect(state.upCard).not.toBeNull();
    const ids = [...state.hands[0], ...state.hands[1], ...state.hands[2], ...state.hands[3], state.upCard!].map(c => c.id);
    expect(new Set(ids).size).toBe(21);
    expect(state.deck).toHaveLength(11);
  });

  it("uses the upcard and deals the remaining 11 cards without duplicates", () => {
    const initial = createDeal(123, 0);
    const player = initial.currentPlayer;
    const dealt = reduceDeal(initial, { type: "TAKE_UPCARD" });
    expect(dealt.phase).toBe("DECLARATIONS");
    expect([0,1,2,3].map(p => dealt.hands[p as 0|1|2|3].length)).toEqual([8,8,8,8]);
    const cards = [0,1,2,3].flatMap(p => dealt.hands[p as 0|1|2|3]);
    expect(cards).toHaveLength(32);
    expect(new Set(cards.map(c => c.id)).size).toBe(32);
    expect(dealt.hands[player].some(c => c.id === initial.upCard?.id)).toBe(true);
    expect(dealt.deck).toHaveLength(0);
  });

  it("moves to round two after four passes and redeals after four more", () => {
    let state = createDeal(9, 2);
    for (let i = 0; i < 4; i++) state = reduceDeal(state, { type: "PASS" });
    expect(state.phase).toBe("BIDDING_ROUND_2");
    for (let i = 0; i < 4; i++) state = reduceDeal(state, { type: "PASS" });
    expect(state.phase).toBe("REDEAL");
  });

  it("is deterministic for the same seed and dealer", () => {
    expect(createDeal(44, 1)).toEqual(createDeal(44, 1));
  });
});
