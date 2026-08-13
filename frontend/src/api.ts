import type { AiRecommendation, GrowthData, HomeData, Item, OutfitItem } from "@/types";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`请求失败: ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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
  saveLook: (payload: { main_item_id: number; second_item_id?: number | null; reason: string; context: string }) =>
    post<{ ok: boolean; count: number }>("/api/saved", payload),
  todayAdd: (itemId: number) => post<{ ok: boolean; outfit_id: number }>("/api/today/add", { item_id: itemId }),
};
