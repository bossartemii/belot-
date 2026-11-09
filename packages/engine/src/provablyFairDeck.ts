import type { Card, Rank, Suit } from "./index";

export interface ServerSeedCommitment {
  serverSeed: string;
  salt: string;
  commitment: string;
}

export interface FairDeckReveal {
  serverSeed: string;
  salt: string;
  tableId: string;
  roundNumber: number;
  cutIndex: number;
  deckSize: 24 | 32;
}

const SUITS: Suit[] = ["diamonds", "hearts", "clubs", "spades"];
const RANKS_32: Rank[] = ["7", "8", "9", "10", "J", "Q", "K", "A"];
const RANKS_24: Rank[] = ["9", "10", "J", "Q", "K", "A"];
const encoder = new TextEncoder();

function webCrypto(): Crypto {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error("Web Crypto API is required for provably-fair shuffling");
  }
  return globalThis.crypto;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) throw new Error("Seed must be non-empty hexadecimal");
  return Uint8Array.from(hex.match(/.{2}/g)!, (byte) => Number.parseInt(byte, 16));
}

async function sha256(value: string): Promise<string> {
  const digest = await webCrypto().subtle.digest("SHA-256", encoder.encode(value));
  return toHex(new Uint8Array(digest));
}

export async function createServerSeedCommitment(): Promise<ServerSeedCommitment> {
  const serverSeedBytes = webCrypto().getRandomValues(new Uint8Array(32));
  const saltBytes = webCrypto().getRandomValues(new Uint8Array(16));
  const serverSeed = toHex(serverSeedBytes);
  const salt = toHex(saltBytes);
  const commitment = await sha256(`belot-v1:${serverSeed}:${salt}`);
  return { serverSeed, salt, commitment };
}

async function hmacBlock(key: CryptoKey, message: string): Promise<Uint8Array> {
  const signature = await webCrypto().subtle.sign("HMAC", key, encoder.encode(message));
  return new Uint8Array(signature);
}

/** Generate an unbiased integer in [0, maxExclusive) from HMAC-SHA-256 blocks. */
async function randomBelow(
  key: CryptoKey,
  context: string,
  counter: { value: number },
  maxExclusive: number
): Promise<number> {
  const range = 0x1_0000_0000;
  const limit = Math.floor(range / maxExclusive) * maxExclusive;
  while (true) {
    const block = await hmacBlock(key, `${context}:block:${counter.value++}`);
    const value = new DataView(block.buffer, block.byteOffset, block.byteLength).getUint32(0, false);
    if (value < limit) return value % maxExclusive;
  }
}

function baseDeck(deckSize: 24 | 32): Card[] {
  const ranks = deckSize === 32 ? RANKS_32 : RANKS_24;
  return SUITS.flatMap((suit) => ranks.map((rank) => ({
    suit, rank, id: `${suit}-${rank}` as const
  })));
}

export async function generateProvablyFairDeck(
  reveal: FairDeckReveal
): Promise<Card[]> {
  if (!reveal.tableId.trim()) throw new Error("tableId is required");
  if (!Number.isSafeInteger(reveal.roundNumber) || reveal.roundNumber < 1) {
    throw new RangeError("roundNumber must be a positive safe integer");
  }
  if (!Number.isInteger(reveal.cutIndex) || reveal.cutIndex < 1 || reveal.cutIndex >= reveal.deckSize) {
    throw new RangeError(`cutIndex must be between 1 and ${reveal.deckSize - 1}`);
  }
  const seedBytes = fromHex(reveal.serverSeed);
  if (seedBytes.length !== 32) throw new Error("serverSeed must contain exactly 32 bytes");
  fromHex(reveal.salt);
  const commitment = await sha256(`belot-v1:${reveal.serverSeed}:${reveal.salt}`);
  // The caller must compare this value with the commitment published before the cut.
  void commitment;

  const key = await webCrypto().subtle.importKey(
    "raw", seedBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const context = `belot-v1:${reveal.salt}:${reveal.tableId}:${reveal.roundNumber}:${reveal.cutIndex}:${reveal.deckSize}`;
  const counter = { value: 0 };
  const deck = baseDeck(reveal.deckSize);

  for (let i = deck.length - 1; i > 0; i--) {
    const j = await randomBelow(key, context, counter, i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return [...deck.slice(reveal.cutIndex), ...deck.slice(0, reveal.cutIndex)];
}

export async function verifyServerSeedCommitment(
  serverSeed: string,
  salt: string,
  expectedCommitment: string
): Promise<boolean> {
  try {
    const actual = await sha256(`belot-v1:${serverSeed}:${salt}`);
    return actual === expectedCommitment.toLowerCase();
  } catch {
    return false;
  }
}
