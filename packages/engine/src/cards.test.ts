import { describe, expect, it } from "vitest";
import { compareCards, makeDeck, trickWinner, type Card } from "./index";

const card = (suit: Card["suit"], rank: Card["rank"]) =>
  makeDeck().find(c => c.suit === suit && c.rank === rank)!;

describe("card comparison", () => {
  it("uses 8 above 7 in a plain suit", () => {
    expect(compareCards(card("clubs", "8"), card("clubs", "7"), "clubs", "spades")).toBeGreaterThan(0);
  });

  it("lets any trump beat a plain lead card", () => {
    expect(compareCards(card("spades", "7"), card("clubs", "A"), "clubs", "spades")).toBeGreaterThan(0);
  });

  it("uses the trump jack above the trump nine", () => {
    expect(compareCards(card("spades", "J"), card("spades", "9"), "spades", "spades")).toBeGreaterThan(0);
  });

  it("resolves a complete trick with the same comparator", () => {
    const trick = [
      { seat: 0 as const, card: card("clubs", "A") },
      { seat: 1 as const, card: card("clubs", "8") },
      { seat: 2 as const, card: card("spades", "7") },
      { seat: 3 as const, card: card("clubs", "10") }
    ];
    expect(trickWinner(trick, "spades")).toBe(2);
  });
});
