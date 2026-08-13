export interface Item {
  id: number;
  name: string;
  emoji: string;
  category: string;
  color_hex: string;
  tags: string[];
  story: string;
  love_level: number;
  created_at: string;
  worn_count?: number;
  worn?: number;
  /** 去背景透明 PNG（未来真实服装图），缺省时回退到版画占位 */
  image_url?: string | null;
}

export interface OutfitItem {
  id: number;
  date: string;
  title: string;
  mood: string;
  weather: string;
  occasion: string;
  note: string;
  items: Item[];
}

export interface AiRecommendation {
  combo: Item[];
  context: string;
  reason: string;
}

export interface HomeData {
  masthead: { vol: number; date: string; month: string; day: number };
  mood: { emoji: string; word: string; note: string };
  today_outfit: OutfitItem | null;
  style_keywords: string[];
  recent_collections: Item[];
  ai_recommendation: AiRecommendation;
}

export interface GrowthData {
  total_items: number;
  age_days: number;
  worn_total: number;
  most_worn: Item[];
  style_keywords: { label: string; count: number }[];
  monthly: { month: string; count: number }[];
  favorites: OutfitItem[];
}
