import type { Collection, HomeData, Item, Look, Wear } from "@/types";

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

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
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

export interface ItemPayload {
  name: string;
  category: string;
  emoji?: string;
  color_hex: string;
  tags: string[];
  story: string;
  love_level: number;
  image_url?: string | null;
  image_type?: "cutout" | "photo";
}

export const api = {
  home: () => get<HomeData>("/api/home"),
  items: (params?: { category?: string; collection_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.category && params.category !== "全部") q.set("category", params.category);
    if (params?.collection_id) q.set("collection_id", String(params.collection_id));
    const s = q.toString();
    return get<{ items: Item[] }>(`/api/items${s ? `?${s}` : ""}`);
  },
  item: (id: number | string) => get<{ item: Item }>(`/api/items/${id}`),
  itemCreate: (payload: ItemPayload) => post<{ item: Item }>("/api/items", payload),
  itemUpdate: (id: number | string, payload: ItemPayload) => put<{ item: Item }>(`/api/items/${id}`, payload),
  itemDelete: (id: number) => del<{ ok: boolean }>(`/api/items/${id}`),
  looks: () => get<{ looks: Look[] }>("/api/looks"),
  lookCreate: (payload: { title: string; note: string; item_ids: number[] }) =>
    post<{ look: Look }>("/api/looks", payload),
  lookDelete: (id: number) => del<{ ok: boolean }>(`/api/looks/${id}`),
  collections: () => get<{ collections: Collection[] }>("/api/collections"),
  collectionCreate: (name: string) => post<{ collection: Collection }>("/api/collections", { name }),
  collectionDelete: (id: number) => del<{ ok: boolean }>(`/api/collections/${id}`),
  collectionAddItem: (cid: number, itemId: number) =>
    post<{ ok: boolean }>(`/api/collections/${cid}/items`, { item_id: itemId }),
  collectionRemoveItem: (cid: number, itemId: number) =>
    del<{ ok: boolean }>(`/api/collections/${cid}/items/${itemId}`),
  wears: () => get<{ wears: Wear[] }>("/api/wears"),
  wearCreate: (payload: { date?: string; item_ids: number[]; weather: string; note: string }) =>
    post<{ wear: Wear }>("/api/wears", payload),
  wearDelete: (id: number) => del<{ ok: boolean }>(`/api/wears/${id}`),
  itemUpload: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/items/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("上传失败");
    return res.json() as Promise<{ url: string; image_type: "cutout" | "photo" }>;
  },
};
