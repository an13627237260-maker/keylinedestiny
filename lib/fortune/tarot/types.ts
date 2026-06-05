export type TarotSuit =
  | "major"
  | "wands"
  | "cups"
  | "swords"
  | "pentacles";

export type TarotArcana = "major" | "minor";

export type TarotOrientation = "upright" | "reversed";

export type TarotFocusArea =
  | "overall"
  | "love"
  | "career"
  | "wealth"
  | "study";

export interface TarotCardDefinition {
  id: string;
  nameCn: string;
  nameEn: string;
  suit: TarotSuit;
  arcana: TarotArcana;
  number?: number | string;
  uprightKeywords: string[];
  reversedKeywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  loveMeaning: string;
  careerMeaning: string;
  wealthMeaning: string;
  studyMeaning: string;
  advice: string;
  warning: string;
}

export interface TarotSpreadPosition {
  id: string;
  name: string;
  meaning: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  description: string;
  count: number;
  positions: TarotSpreadPosition[];
}

export interface DrawnTarotCard {
  card: TarotCardDefinition;
  orientation: TarotOrientation;
  position: TarotSpreadPosition;
  keywords: string[];
  interpretation: string;
}

export interface TarotReading {
  id: string;
  question: string;
  focusArea: TarotFocusArea;
  spread: TarotSpread;
  createdAt: string;
  cards: DrawnTarotCard[];
  summary: string;
  advice: string[];
  cautions: string[];
  disclaimer: string;
  randomTrace: {
    method: string;
    drawnCardIds: string[];
    orientations: TarotOrientation[];
    timestamp: string;
  };
}

export type TarotSpreadType = "single" | "threeCard" | "love" | "career" | "yesNo";
export type TarotCard = TarotCardDefinition;
export type DrawnCard = DrawnTarotCard;
export type TarotReadingResult = TarotReading;
