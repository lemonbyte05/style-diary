/** 品类（录入 / 筛选 / 版画共用） */
export const CATEGORIES = ["上衣", "下装", "裙装", "外套", "鞋", "包", "配饰", "其他"] as const;

/** 可选字段的月份展示名 */
export const SEASONS = ["春", "夏", "秋", "冬", "四季"] as const;

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
  /** 图类型：cutout=透明PNG（contain 展示），photo=普通照片 */
  image_type?: "cutout" | "photo";
  season?: string;
  brand?: string;
  material?: string;
  purchased_at?: string;
  price?: string;
}

/** 手动搭配（我的搭配） */
export interface Look {
  id: number;
  created_at: string;
  title: string;
  note: string;
  /** 灵感来源（可选）：这个 Look 是从哪张灵感参考来的 */
  inspiration_id?: number | null;
  /** 灵感来源缩略图（可选） */
  inspiration_image?: string | null;
  items: Item[];
}

/** 灵感集的快速标签 */
export const INSPIRATION_TAGS = ["通勤", "休闲", "约会", "秋冬", "春夏", "配色", "单品", "想买", "想尝试"] as const;

/** 灵感：一张喜欢的穿搭/配色图，先存后整理 */
export interface Inspiration {
  id: number;
  image_url: string;
  tags: string[];
  note: string;
  created_at: string;
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
