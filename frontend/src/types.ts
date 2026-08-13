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

/** 手动搭配（我的搭配） */
export interface Look {
  id: number;
  created_at: string;
  title: string;
  note: string;
  items: Item[];
}

export interface HomeData {
  masthead: { vol: number; date: string; month: string; day: number };
  total_items: number;
  recent_collections: Item[];
}
