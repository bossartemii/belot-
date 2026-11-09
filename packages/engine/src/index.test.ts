import { describe, expect, it } from "vitest";
import { deal, legalCards, makeDeck, seededRandom, shuffle, trickWinner, trickPoints, type Card } from "./index";

const c = (suit: Card["suit"], rank: Card["rank"]): Card => ({ suit, rank, id: `${suit}-${rank}` as const });

describe("Belot rules core", () => {
  it("builds a 32-card deck and deals 8 cards to each seat", () => {
    expect(makeDeck()).toHaveLength(32);
    const hands = deal(42);
    expect(hands).toHaveLength(4);
    expect(hands.every((h) => h.length === 8)).toBe(true);
    expect(new Set(hands.flat().map((x) => x.id)).size).toBe(32);
  });
  it("shuffles reproducibly with a fixed seed", () => {
    expect(shuffle(makeDeck(), seededRandom(7))).toEqual(shuffle(makeDeck(), seededRandom(7)));
  });
  it("requires following suit when possible", () => {
    const hand = [c("hearts", "7"), c("clubs", "A"), c("spades", "J")];
    const trick = [{ seat: 0 as const, card: c("hearts", "8") }];
    expect(legalCards(hand, trick, "spades").map((x) => x.id)).toEqual(["hearts-7"]);
  });
  it("requires trumping when void in the led suit", () => {
    const hand = [c("spades", "7"), c("clubs", "A")];
    const trick = [{ seat: 0 as const, card: c("hearts", "8") }];
    expect(legalCards(hand, trick, "spades").map((x) => x.id)).toEqual(["spades-7"]);
  });
  it("does not cut or overcut when partner is winning a plain-suit trick", () => {
    const hand = [c("spades", "7"), c("spades", "J"), c("clubs", "A")];
    const trick = [
      { seat: 0 as const, card: c("hearts", "A") },
      { seat: 1 as const, card: c("spades", "7") },
      { seat: 2 as const, card: c("hearts", "7") }
    ];
    expect(legalCards(hand, trick, "spades").map((x) => x.id)).toEqual(hand.map((x) => x.id));
  });
  it("requires overtrumping when trump was led, even when partner is currently winning", () => {
    const hand = [c("spades", "J"), c("spades", "7"), c("clubs", "A")];
    const trick = [
      { seat: 0 as const, card: c("spades", "9") },
      { seat: 1 as const, card: c("spades", "A") }
    ];
    expect(legalCards(hand, trick, "spades").map((x) => x.id)).toEqual(["spades-J"]);
  });
  it("recognizes the trump jack as highest and scores trump cards", () => {
    const trick = [
      { seat: 0 as const, card: c("hearts", "A") },
      { seat: 1 as const, card: c("spades", "9") },
      { seat: 2 as const, card: c("spades", "J") },
      { seat: 3 as const, card: c("hearts", "7") }
    ];
    expect(trickWinner(trick, "spades")).toBe(2);
    expect(trickPoints(trick, "spades")).toBe(11 + 14 + 20 + 0 + 10);
  });
});
