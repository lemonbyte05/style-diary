import type { HomeData, Item, Look } from "@/types";

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

async function del<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) throw new Error(`请求失败: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  home: () => get<HomeData>("/api/home"),
  items: (category?: string) =>
    get<{ items: Item[] }>(`/api/items${category && category !== "全部" ? `?category=${encodeURIComponent(category)}` : ""}`),
  item: (id: number | string) => get<{ item: Item }>(`/api/items/${id}`),
  looks: () => get<{ looks: Look[] }>("/api/looks"),
  lookCreate: (payload: { title: string; note: string; item_ids: number[] }) =>
    post<{ look: Look }>("/api/looks", payload),
  lookDelete: (id: number) => del<{ ok: boolean }>(`/api/looks/${id}`),
};
