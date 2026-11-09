import { describe, expect, it } from "vitest";
import { createMatch, reduceMatch } from "./match";

describe("match wrapper", () => {
  it("starts with the configured target and initial dealer", () => {
    const match = createMatch(100, 2, 1001);
    expect(match.target).toBe(1001);
    expect(match.dealer).toBe(2);
    expect(match.teamScores).toEqual({ 0: 0, 1: 0 });
    expect(match.activeDeal.dealer).toBe(2);
  });

  it("rotates the dealer after a null deal without awarding points", () => {
    let match = createMatch(100, 2, 501);
    for (let i = 0; i < 8; i++) {
      match = reduceMatch(match, { type: "PASS", player: state.currentPlayer });
    }
    expect(match.dealer).toBe(3);
    expect(match.activeDeal.dealer).toBe(3);
    expect(match.activeDeal.phase).toBe("BIDDING_ROUND_1");
    expect(match.teamScores).toEqual({ 0: 0, 1: 0 });
    expect(match.completedDeals).toBe(1);
  });

  it("does not mutate the original state when an action is invalid", () => {
    const match = createMatch(100, 0, 501);
    const unchanged = reduceMatch(match, { type: "PLAY_CARD", player: match.activeDeal.currentPlayer, cardId: "clubs-7" });
    expect(unchanged).toBe(match);
    expect(match.activeDeal.phase).toBe("BIDDING_ROUND_1");
  });
});
