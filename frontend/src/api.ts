import type { AiRecommendation, GrowthData, HomeData, Item, OutfitItem } from "@/types";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`请求失败: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  home: () => get<HomeData>("/api/home"),
  items: (category?: string) =>
    get<{ items: Item[] }>(`/api/items${category && category !== "全部" ? `?category=${encodeURIComponent(category)}` : ""}`),
  item: (id: number | string) => get<{ item: Item }>(`/api/items/${id}`),
  aiRecommend: (occasion?: string) =>
    get<AiRecommendation>(`/api/ai/recommend${occasion ? `?occasion=${encodeURIComponent(occasion)}` : ""}`),
  outfits: () => get<{ outfits: OutfitItem[] }>("/api/outfits"),
  growth: () => get<GrowthData>("/api/growth"),
};
