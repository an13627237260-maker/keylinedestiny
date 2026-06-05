export type TarotSuit = "Wands" | "Cups" | "Swords" | "Pentacles" | "Major";
export type TarotArcana = "major" | "minor";

export interface TarotCard {
  id: string;
  nameCn: string;
  nameEn: string;
  suit: TarotSuit;
  arcana: TarotArcana;
  uprightKeywords: string[];
  reversedKeywords: string[];
  loveMeaning: string;
  careerMeaning: string;
  wealthMeaning: string;
  advice: string;
  warning: string;
}

export type TarotSpreadType =
  | "single"
  | "threeCard"
  | "love"
  | "career"
  | "yesNo";

export interface DrawnCard {
  card: TarotCard;
  upright: boolean;
  position: string;
}

export interface TarotReadingResult {
  spread: TarotSpreadType;
  question?: string;
  cards: DrawnCard[];
  seed: string;
  randomTrace: number[];
  algorithmicInterpretation: string;
}
