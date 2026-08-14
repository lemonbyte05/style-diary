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
  /** 实际穿过次数（穿搭记录） */
  worn_count?: number;
  /** 出现在几套搭配里 */
  look_count?: number;
  worn?: number;
  collections?: number[];
  /** 去背景透明 PNG（未来真实服装图），缺省时回退到版画占位 */
  image_url?: string | null;
  /** 图类型：cutout=透明PNG（contain 展示），photo=普通照片（cover 展示） */
  image_type?: "cutout" | "photo";
}

/** 手动搭配（我的搭配） */
export interface Look {
  id: number;
  created_at: string;
  title: string;
  note: string;
  items: Item[];
}

/** 我的收藏夹（自定义分组） */
export interface Collection {
  id: number;
  name: string;
  created_at: string;
  item_ids: number[];
  count: number;
}

/** 穿搭记录（Wear Log）：某天实际穿了哪些单品 */
export interface Wear {
  id: number;
  date: string;
  weather: string;
  note: string;
  created_at: string;
  items: Item[];
}

export interface TodayMood {
  emoji: string;
  word: string;
  note: string;
}

export interface TodayEdit {
  main: Item;
  accessory: Item | null;
  mood: TodayMood;
  caption: string;
  date: string;
}

export interface HomeData {
  masthead: { vol: number; date: string; month: string; day: number };
  total_items: number;
  recent_collections: Item[];
  today_edit: TodayEdit | null;
}
