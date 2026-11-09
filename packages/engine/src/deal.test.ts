import { describe, expect, it } from "vitest";
import { createDeal, getPlayerView, reduceDeal } from "./deal";
import { legalCards } from "./index";

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
    const dealt = reduceDeal(initial, { type: "TAKE_UPCARD", player: initial.currentPlayer });
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
    for (let i = 0; i < 4; i++) state = reduceDeal(state, { type: "PASS", player: state.currentPlayer });
    expect(state.phase).toBe("BIDDING_ROUND_2");
    for (let i = 0; i < 4; i++) state = reduceDeal(state, { type: "PASS", player: state.currentPlayer });
    expect(state.phase).toBe("REDEAL");
  });

  it("is deterministic for the same seed and dealer", () => {
    expect(createDeal(44, 1)).toEqual(createDeal(44, 1));
  });
  it("settles a four-card trick before capturing it and advancing", () => {
    let state = createDeal(1234, 0);
    state = reduceDeal(state, { type: "TAKE_UPCARD", player: state.currentPlayer });
    for (let i = 0; i < 4; i++) state = reduceDeal(state, { type: "DECLARE", player: state.currentPlayer, announcements: [] });
    for (let i = 0; i < 4; i++) {
      const hand = state.hands[state.currentPlayer];
      const card = legalCards(hand, state.currentTrick, state.trumpSuit!)[0];
      state = reduceDeal(state, { type: "PLAY_CARD", player: state.currentPlayer, cardId: card.id });
    }
    expect(state.phase).toBe("TRICK_SETTLED");
    expect(state.currentTrick).toHaveLength(4);
    expect(state.completedTricksCount).toBe(0);
    const winner = state.settledWinner;
    state = reduceDeal(state, { type: "ADVANCE_TRICK" });
    expect(state.phase).toBe("TRICK_PLAY");
    expect(state.currentTrick).toHaveLength(0);
    expect(state.completedTricksCount).toBe(1);
    expect(state.currentPlayer).toBe(winner);
  });

  it("keeps opponents hands and unrevealed announcement details out of player views", () => {
    let state = reduceDeal(createDeal(321, 0), { type: "TAKE_UPCARD", player: 1 });
    for (let i = 0; i < 4; i++) {
      state = reduceDeal(state, { type: "DECLARE", player: state.currentPlayer, announcements: [] });
    }
    const view = getPlayerView(state, 1);
    expect(view.ownHand).toHaveLength(8);
    expect(view.handSizes).toEqual({ 0: 8, 1: 8, 2: 8, 3: 8 });
    expect(view.revealedAnnouncements).toEqual([]);
    expect("privateDetectedAnnouncements" in view).toBe(false);
    expect("hands" in view).toBe(false);
    expect("deck" in view).toBe(false);
  });

});
