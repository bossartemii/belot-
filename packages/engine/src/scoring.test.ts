import { describe, expect, it } from "vitest";
import {
  createDeal,
  reduceDeal,
  resolveDealScores,
  compareAnnouncementDominance,
  filterValidAnnouncements,
  type Announcement,
  type DealState,
  type TeamId
} from "./deal";
import { makeDeck, cardPoints, TRUMP_POINTS, PLAIN_POINTS } from "./index";

const trump = "spades" as const;
const deck = makeDeck();
const byIndexes = (indexes: readonly number[]) => indexes.map(index => deck[index]);
const complement = (indexes: readonly number[]) => deck.filter((_, index) => !indexes.includes(index));

// 16 cards scoring 80 with spades as trump; the complement scores 72.
const faitTeam0Indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 19, 20, 23];
// 16 cards scoring 71; its complement scores 81.
const atarnatTeam0Indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 15, 19, 21];
// First 16 cards (clubs + diamonds) score 60.
const chuteTeam0Indexes = Array.from({ length: 16 }, (_, index) => index);

function baseState(overrides: Partial<DealState> = {}): DealState {
  const initial = createDeal(90210, 0);
  const dealt = reduceDeal(initial, {
    type: "BID",
    player: initial.currentPlayer,
    choice: "TAKE"
  });
  return { ...dealt, ...overrides } as DealState;
}

function announcement(overrides: Partial<Announcement> & Pick<Announcement, "id" | "player" | "team" | "type" | "rank" | "points">): Announcement {
  return overrides as Announcement;
}

describe("Belot scoring engine — deterministic mathematical invariants", () => {
  it("conserves exactly 162 points across 32 cards and the last-trick bonus", () => {
    const trumpTotal = Object.values(TRUMP_POINTS).reduce((sum, value) => sum + value, 0);
    const plainTotal = Object.values(PLAIN_POINTS).reduce((sum, value) => sum + value, 0);
    const deckTotal = deck.reduce((sum, card) => sum + cardPoints(card, trump), 0);

    expect(trumpTotal).toBe(62);
    expect(plainTotal).toBe(30);
    expect(deckTotal).toBe(152);
    expect(deckTotal + 10).toBe(162);
  });

  it("FAIT: awards each team's own points and releases the entire Atârnat buffer", () => {
    const team0 = byIndexes(faitTeam0Indexes);
    const team1 = complement(faitTeam0Indexes);
    const state = baseState({
      declarerTeam: 0,
      capturedCards: { 0: team0, 1: team1 },
      lastTrickWinner: 0,
      suspendedPoints: 60
    });

    const resolved = resolveDealScores(state);
    expect(resolved.roundScore?.outcome).toBe("FAIT");
    expect(resolved.roundScore?.team0).toBe(90);
    expect(resolved.roundScore?.team1).toBe(72);
    expect(resolved.roundScore?.pointsAwardedToTeam0).toBe(150);
    expect(resolved.roundScore?.pointsAwardedToTeam1).toBe(72);
    expect(resolved.suspendedPoints).toBe(0);
  });

  it("CHUTE: awards the complete pot, announcements and prior buffer to defenders", () => {
    const team0 = byIndexes(chuteTeam0Indexes);
    const team1 = complement(chuteTeam0Indexes);
    const declared = announcement({
      id: "attacker-tert", player: 0, team: 0, type: "TERT", rank: "K", suit: "hearts", points: 20
    });
    const state = baseState({
      declarerTeam: 0,
      capturedCards: { 0: team0, 1: team1 },
      lastTrickWinner: 1,
      declaredAnnouncements: [declared],
      validatedAnnouncements: [declared],
      suspendedPoints: 50
    });

    const resolved = resolveDealScores(state);
    expect(resolved.roundScore?.outcome).toBe("CHUTE");
    expect(resolved.roundScore?.team0).toBe(60);
    expect(resolved.roundScore?.team1).toBe(102);
    expect(resolved.roundScore?.pointsAwardedToTeam0).toBe(0);
    expect(resolved.roundScore?.pointsAwardedToTeam1).toBe(232);
    expect(resolved.suspendedPoints).toBe(0);
  });

  it("ATÂRNAT: freezes attacker points and accumulates them with the previous buffer", () => {
    const team0 = byIndexes(atarnatTeam0Indexes);
    const team1 = complement(atarnatTeam0Indexes);
    const state = baseState({
      declarerTeam: 0,
      capturedCards: { 0: team0, 1: team1 },
      lastTrickWinner: 0,
      suspendedPoints: 30
    });

    const resolved = resolveDealScores(state);
    expect(resolved.roundScore?.outcome).toBe("ATARNAT");
    expect(resolved.roundScore?.team0).toBe(81);
    expect(resolved.roundScore?.team1).toBe(81);
    expect(resolved.roundScore?.pointsAwardedToTeam0).toBe(0);
    expect(resolved.roundScore?.pointsAwardedToTeam1).toBe(81);
    expect(resolved.suspendedPoints).toBe(111);
  });

  it("releases a chained Atârnat buffer to the team that wins the next contract", () => {
    const team0 = byIndexes(faitTeam0Indexes);
    const team1 = complement(faitTeam0Indexes);
    const state = baseState({
      declarerTeam: 1,
      capturedCards: { 0: team1, 1: team0 },
      lastTrickWinner: 1,
      suspendedPoints: 111
    });

    const resolved = resolveDealScores(state);
    expect(resolved.roundScore?.outcome).toBe("FAIT");
    expect(resolved.roundScore?.pointsAwardedToTeam1).toBe(201);
    expect(resolved.roundScore?.pointsAwardedToTeam0).toBe(72);
    expect(resolved.suspendedPoints).toBe(0);
  });

  it("offensive Capot: attackers score 250 plus their valid announcements; defenders retain Belot", () => {
    const ownAnnouncement = announcement({
      id: "attacker-50", player: 0, team: 0, type: "CINCIZECI", rank: "A", suit: "hearts", points: 50
    });
    const state = baseState({
      declarerTeam: 0,
      tricksWon: { 0: 8, 1: 0 },
      validatedAnnouncements: [ownAnnouncement],
      declaredAnnouncements: [ownAnnouncement],
      belotPlayers: [1]
    });

    const resolved = resolveDealScores(state);
    expect(resolved.roundScore?.isCapot).toBe(true);
    expect(resolved.roundScore?.outcome).toBe("FAIT");
    expect(resolved.roundScore?.pointsAwardedToTeam0).toBe(300);
    expect(resolved.roundScore?.pointsAwardedToTeam1).toBe(20);
  });

  it("defensive Capot: defenders take 250 plus every declared announcement, Belot and buffer", () => {
    const fallenCareu = announcement({
      id: "attacker-careu", player: 0, team: 0, type: "CAREU", rank: "J", points: 200
    });
    const state = baseState({
      declarerTeam: 0,
      tricksWon: { 0: 0, 1: 8 },
      declaredAnnouncements: [fallenCareu],
      belotPlayers: [0],
      suspendedPoints: 40
    });

    const resolved = resolveDealScores(state);
    expect(resolved.roundScore?.isCapot).toBe(true);
    expect(resolved.roundScore?.outcome).toBe("CHUTE");
    expect(resolved.roundScore?.pointsAwardedToTeam0).toBe(0);
    expect(resolved.roundScore?.pointsAwardedToTeam1).toBe(510);
    expect(resolved.suspendedPoints).toBe(0);
  });

  it("Careu always dominates an O sută sequence", () => {
    const sequence = announcement({
      id: "sequence", player: 0, team: 0, type: "O_SUTA", rank: "A", suit: "hearts", points: 100
    });
    const careu = announcement({
      id: "careu-q", player: 1, team: 1, type: "CAREU", rank: "Q", points: 100
    });

    expect(compareAnnouncementDominance(careu, sequence, trump)).toBeGreaterThan(0);
    expect(compareAnnouncementDominance(sequence, careu, trump)).toBeLessThan(0);
  });

  it("orders 100-point Careuri by natural rank: A > 10 > K > Q", () => {
    const careuKing = announcement({ id: "k", player: 0, team: 0, type: "CAREU", rank: "K", points: 100 });
    const careuTen = announcement({ id: "10", player: 1, team: 1, type: "CAREU", rank: "10", points: 100 });
    expect(compareAnnouncementDominance(careuTen, careuKing, trump)).toBeGreaterThan(0);
  });

  it("breaks equal sequence announcements in favor of the trump suit", () => {
    const trumpSequence = announcement({
      id: "trump-tert", player: 0, team: 0, type: "TERT", rank: "K", suit: trump, points: 20
    });
    const plainSequence = announcement({
      id: "plain-tert", player: 1, team: 1, type: "TERT", rank: "K", suit: "hearts", points: 20
    });
    expect(compareAnnouncementDominance(trumpSequence, plainSequence, trump)).toBeGreaterThan(0);
  });

  it("validates every announcement from the dominant team and cancels the opposing team's announcements", () => {
    const announcements: Announcement[] = [
      announcement({ id: "careu-j", player: 0, team: 0, type: "CAREU", rank: "J", points: 200 }),
      announcement({ id: "team0-tert", player: 2, team: 0, type: "TERT", rank: "A", suit: "hearts", points: 20 }),
      announcement({ id: "team1-osuta", player: 1, team: 1, type: "O_SUTA", rank: "A", suit: "clubs", points: 100 })
    ];

    expect(filterValidAnnouncements(announcements, trump).map(item => item.id)).toEqual(["careu-j", "team0-tert"]);
  });
});
