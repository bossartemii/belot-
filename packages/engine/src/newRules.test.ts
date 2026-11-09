import { describe, expect, it } from "vitest";
import { calculateRound3Players, pointsToBile } from "./scoring3p";
import { filterAllowedCombinations } from "./reducedCombinations";
import {
  createServerSeedCommitment,
  generateProvablyFairDeck,
  verifyServerSeedCommitment
} from "./provablyFairDeck";

describe("3-player residual bile scoring", () => {
  it("rounds 64 and 65 down, but 66 up", () => {
    expect(pointsToBile(64)).toBe(6);
    expect(pointsToBile(65)).toBe(6);
    expect(pointsToBile(66)).toBe(7);
  });

  it("gives the maker the residual after rounding both passive players", () => {
    const result = calculateRound3Players("x", [
      { id: "x", rawPoints: 85, hasTrick: true },
      { id: "y", rawPoints: 40, hasTrick: true },
      { id: "z", rawPoints: 37, hasTrick: true }
    ]);
    expect(result.bile).toEqual({ x: 8, y: 4, z: 4 });
    expect(result.isBT).toBe(false);
    expect(result.isDraw).toBe(false);
  });

  it("uses raw points to break a tie at the maker's highest defender bile", () => {
    const result = calculateRound3Players("x", [
      { id: "x", rawPoints: 79, hasTrick: true },
      { id: "y", rawPoints: 80, hasTrick: true },
      { id: "z", rawPoints: 7, hasTrick: true }
    ]);
    expect(result.bile).toEqual({ x: 0, y: 8, z: 1 });
    expect(result.isBT).toBe(true);
  });

  it("declares a draw when both bile and the top raw score are equal", () => {
    const result = calculateRound3Players("x", [
      { id: "x", rawPoints: 80, hasTrick: true },
      { id: "y", rawPoints: 80, hasTrick: true },
      { id: "z", rawPoints: 6, hasTrick: true }
    ]);
    expect(result.bile).toEqual({ x: 8, y: 8, z: 1 });
    expect(result.isDraw).toBe(true);
    expect(result.isBT).toBe(false);
  });

  it("applies the -10 bile capot penalty to a player who took no trick", () => {
    const result = calculateRound3Players("x", [
      { id: "x", rawPoints: 100, hasTrick: true },
      { id: "y", rawPoints: 31, hasTrick: false },
      { id: "z", rawPoints: 31, hasTrick: true }
    ]);
    expect(result.bile.y).toBe(-7);
  });

  it("rejects invalid player sets and invalid point values", () => {
    expect(() => calculateRound3Players("missing", [
      { id: "x", rawPoints: 10, hasTrick: true },
      { id: "y", rawPoints: 20, hasTrick: true },
      { id: "z", rawPoints: 30, hasTrick: true }
    ])).toThrow();
    expect(() => pointsToBile(Number.NaN)).toThrow();
  });
});

describe("match-wide reduced combinations", () => {
  const low = { points: 20, name: "Tărț" };
  const highK = { points: 100, name: "Careu K" };
  const highQ = { points: 100, name: "Careu Q" };

  it("accepts a double high combination after one previous high combination", () => {
    const result = filterAllowedCombinations(
      { playerId: "p1", shownHighCombosCount: 1 },
      [low, highK, highQ],
      true
    );
    expect(result.allowedCombos).toEqual([low, highK, highQ]);
    expect(result.updatedCount).toBe(3);
  });

  it("suppresses every combination when the player takes no trick", () => {
    const result = filterAllowedCombinations(
      { playerId: "p1", shownHighCombosCount: 0 },
      [low, highK],
      false
    );
    expect(result.allowedCombos).toEqual([]);
    expect(result.updatedCount).toBe(0);
  });

  it("blocks further high combinations after the normal two-slot limit", () => {
    const result = filterAllowedCombinations(
      { playerId: "p1", shownHighCombosCount: 2 },
      [low, highK],
      true
    );
    expect(result.allowedCombos).toEqual([low]);
    expect(result.updatedCount).toBe(2);
  });
});

describe("provably fair deck", () => {
  it("reconstructs the same unique deck from the revealed seed and cut", async () => {
    const seed = await createServerSeedCommitment("table-test-1", 1);
    expect(await verifyServerSeedCommitment(seed.serverSeed, "table-test-1", 1, seed.commitment)).toBe(true);
    const reveal = {
      serverSeed: seed.serverSeed,
      salt: seed.salt,
      expectedCommitment: seed.commitment,
      tableId: "table-test-1",
      roundNumber: 1,
      cutIndex: 7,
      deckSize: 32 as const
    };
    const first = await generateProvablyFairDeck(reveal);
    const second = await generateProvablyFairDeck(reveal);
    expect(first).toEqual(second);
    expect(first).toHaveLength(32);
    expect(new Set(first.map((card) => card.id)).size).toBe(32);
  });

  it("rejects a seed that does not match the published commitment", async () => {
    const seed = await createServerSeedCommitment("table-test-1", 1);
    await expect(generateProvablyFairDeck({
      serverSeed: seed.serverSeed,
      salt: seed.salt,
      expectedCommitment: "00".repeat(32),
      tableId: "table-test-1",
      roundNumber: 1,
      cutIndex: 1,
      deckSize: 24
    })).rejects.toThrow(/commitment/);
  });

  it("creates a 24-card deck for 1v1 and 3-player formats", async () => {
    const seed = await createServerSeedCommitment("table-test-2", 2);
    const deck = await generateProvablyFairDeck({
      serverSeed: seed.serverSeed,
      salt: seed.salt,
      expectedCommitment: seed.commitment,
      tableId: "table-test-2",
      roundNumber: 2,
      cutIndex: 3,
      deckSize: 24
    });
    expect(deck).toHaveLength(24);
    expect(new Set(deck.map((card) => card.id)).size).toBe(24);
    expect(deck.every((card) => card.rank !== "7" && card.rank !== "8")).toBe(true);
  });
});
