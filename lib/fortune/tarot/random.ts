import { TAROT_CARDS } from "./cards";
import type { TarotCardDefinition, TarotOrientation } from "./types";

let fallbackState = 0x6d2b79f5;

function nextDeterministicUint32(): number {
  fallbackState = Math.imul(fallbackState ^ (fallbackState >>> 15), 1 | fallbackState);
  fallbackState ^= fallbackState + Math.imul(fallbackState ^ (fallbackState >>> 7), 61 | fallbackState);
  return ((fallbackState ^ (fallbackState >>> 14)) >>> 0);
}

function getCrypto(): Crypto | undefined {
  const cryptoLike = globalThis.crypto;
  if (cryptoLike && typeof cryptoLike.getRandomValues === "function") {
    return cryptoLike;
  }
  return undefined;
}

export function getRandomMethodDescription(): string {
  return getCrypto()
    ? "globalThis.crypto.getRandomValues"
    : "内置确定性 PRNG";
}

export function getSecureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error("随机上限必须是大于 0 的整数");
  }

  const crypto = getCrypto();
  const limit = Math.floor(0x100000000 / max) * max;

  for (let attempt = 0; attempt < 20; attempt++) {
    const value = crypto
      ? crypto.getRandomValues(new Uint32Array(1))[0]
      : nextDeterministicUint32();
    if (value < limit) return value % max;
  }

  throw new Error("抽牌随机数生成失败，请重新尝试");
}

export function shuffleWithCrypto<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawTarotCards(options: {
  count: number;
  allowReversed?: boolean;
}): {
  card: TarotCardDefinition;
  orientation: TarotOrientation;
}[] {
  const { count, allowReversed = true } = options;
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("抽牌数量必须大于 0");
  }
  if (count > TAROT_CARDS.length) {
    throw new Error(`抽牌数量不能超过牌库数量 ${TAROT_CARDS.length}`);
  }

  const selected = shuffleWithCrypto(TAROT_CARDS).slice(0, count);
  return selected.map((card) => ({
    card,
    orientation:
      allowReversed && getSecureRandomInt(2) === 1 ? "reversed" : "upright",
  }));
}

export function seededRandomIntFactory(seed: string): (max: number) => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0 || 0x9e3779b9;
  return (max: number) => {
    if (!Number.isInteger(max) || max <= 0) {
      throw new Error("随机上限必须是大于 0 的整数");
    }
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state % max;
  };
}

export function drawTarotCardsWithSeed(options: {
  count: number;
  seed: string;
  allowReversed?: boolean;
}): {
  card: TarotCardDefinition;
  orientation: TarotOrientation;
}[] {
  const { count, seed, allowReversed = true } = options;
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("抽牌数量必须大于 0");
  }
  if (count > TAROT_CARDS.length) {
    throw new Error(`抽牌数量不能超过牌库数量 ${TAROT_CARDS.length}`);
  }

  const randomInt = seededRandomIntFactory(seed);
  const deck = [...TAROT_CARDS];
  const out: { card: TarotCardDefinition; orientation: TarotOrientation }[] = [];
  for (let i = 0; i < count; i++) {
    const index = randomInt(deck.length);
    const [card] = deck.splice(index, 1);
    out.push({
      card,
      orientation:
        allowReversed && randomInt(2) === 1 ? "reversed" : "upright",
    });
  }
  return out;
}
