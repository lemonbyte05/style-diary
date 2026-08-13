from __future__ import annotations

import json
import random
import uuid
from datetime import date
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import get_connection
from seed import seed, serialize_item

GARMENTS_DIR = Path(__file__).parent / "static" / "garments"
GARMENTS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="My Style Diary", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")


def _load_items(conn, ids: list[int]) -> list[dict]:
    if not ids:
        return []
    placeholders = ",".join("?" for _ in ids)
    rows = conn.execute(
        f"SELECT * FROM items WHERE id IN ({placeholders})", ids
    ).fetchall()
    by_id = {r["id"]: serialize_item(r) for r in rows}
    return [by_id[i] for i in ids if i in by_id]


def _load_look(conn, row) -> dict:
    return {
        "id": row["id"],
        "created_at": row["created_at"],
        "title": row["title"],
        "note": row["note"],
        "items": _load_items(conn, json.loads(row["item_ids"])),
    }


@app.on_event("startup")
def on_startup() -> None:
    seed()


@app.get("/api/home")
def home() -> dict:
    with get_connection() as conn:
        items = [serialize_item(r) for r in conn.execute(
            "SELECT * FROM items ORDER BY id DESC"
        ).fetchall()]
        return {
            "masthead": {
                "vol": 24,
                "date": date.today().isoformat(),
                "month": f"{date.today().month}月",
                "day": date.today().day,
            },
            "total_items": len(items),
            "recent_collections": items[:6],
        }


@app.get("/api/items")
def items(category: Optional[str] = None, collection_id: Optional[int] = None) -> dict:
    with get_connection() as conn:
        result = [serialize_item(r) for r in conn.execute("SELECT * FROM items").fetchall()]
        if collection_id:
            ids = {
                x["item_id"]
                for x in conn.execute(
                    "SELECT item_id FROM collection_items WHERE collection_id = ?",
                    (collection_id,),
                ).fetchall()
            }
            result = [i for i in result if i["id"] in ids]
        if category and category != "全部":
            result = [i for i in result if i["category"] == category]
        result.sort(key=lambda i: (-i["love_level"], i["id"]))
        return {"items": result}


class ItemCreate(BaseModel):
    name: str
    category: str = "上衣"
    emoji: str = "👗"
    color_hex: str = "#F3E9F2"
    tags: list[str] = []
    story: str = ""
    love_level: int = 3
    image_url: Optional[str] = None


@app.post("/api/items")
def items_create(body: ItemCreate) -> dict:
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO items (name, emoji, category, color_hex, tags, story, love_level, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                body.name.strip(),
                body.emoji or "👗",
                body.category,
                body.color_hex,
                json.dumps(body.tags),
                body.story,
                max(1, min(5, body.love_level)),
                body.image_url,
                date.today().isoformat(),
            ),
        )
        row = conn.execute(
            "SELECT * FROM items WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
        return {"item": serialize_item(row)}


@app.post("/api/items/upload")
async def items_upload(file: UploadFile = File(...)) -> dict:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in (".png", ".jpg", ".jpeg", ".webp"):
        return {"error": "不支持的图片格式"}
    name = f"{uuid.uuid4().hex}{ext}"
    dest = GARMENTS_DIR / name
    dest.write_bytes(await file.read())
    return {"url": f"/static/garments/{name}"}


@app.get("/api/items/{item_id}")
def item_detail(item_id: int) -> dict:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if not row:
            return {"error": "not_found"}
        item = serialize_item(row)
        used = 0
        for o in conn.execute("SELECT item_ids FROM looks").fetchall():
            if item_id in json.loads(o["item_ids"]):
                used += 1
        item["worn_count"] = used
        item["collections"] = [
            x["collection_id"]
            for x in conn.execute(
                "SELECT collection_id FROM collection_items WHERE item_id = ?", (item_id,)
            ).fetchall()
        ]
        return {"item": item}


@app.put("/api/items/{item_id}")
def items_update(item_id: int, body: ItemCreate) -> dict:
    with get_connection() as conn:
        if not conn.execute("SELECT 1 FROM items WHERE id = ?", (item_id,)).fetchone():
            return {"error": "not_found"}
        conn.execute(
            """
            UPDATE items
            SET name=?, emoji=?, category=?, color_hex=?, tags=?, story=?, love_level=?, image_url=?
            WHERE id=?
            """,
            (
                body.name.strip(),
                body.emoji or "👗",
                body.category,
                body.color_hex,
                json.dumps(body.tags),
                body.story,
                max(1, min(5, body.love_level)),
                body.image_url,
                item_id,
            ),
        )
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        return {"item": serialize_item(row)}


@app.delete("/api/items/{item_id}")
def items_delete(item_id: int) -> dict:
    with get_connection() as conn:
        conn.execute("DELETE FROM collection_items WHERE item_id = ?", (item_id,))
        for o in conn.execute("SELECT id, item_ids FROM looks").fetchall():
            ids = json.loads(o["item_ids"])
            if item_id in ids:
                ids.remove(item_id)
                conn.execute(
                    "UPDATE looks SET item_ids = ? WHERE id = ?",
                    (json.dumps(ids), o["id"]),
                )
        conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
        return {"ok": True}


@app.get("/api/collections")
def collections_list() -> dict:
    with get_connection() as conn:
        result = []
        for r in conn.execute("SELECT * FROM collections ORDER BY id").fetchall():
            item_ids = [
                x["item_id"]
                for x in conn.execute(
                    "SELECT item_id FROM collection_items WHERE collection_id = ?",
                    (r["id"],),
                ).fetchall()
            ]
            result.append(
                {
                    "id": r["id"],
                    "name": r["name"],
                    "created_at": r["created_at"],
                    "item_ids": item_ids,
                    "count": len(item_ids),
                }
            )
        return {"collections": result}


class CollectionCreate(BaseModel):
    name: str


@app.post("/api/collections")
def collections_create(body: CollectionCreate) -> dict:
    name = body.name.strip()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO collections (name, created_at) VALUES (?, ?)",
            (name, date.today().isoformat()),
        )
        return {
            "collection": {
                "id": cur.lastrowid,
                "name": name,
                "created_at": date.today().isoformat(),
                "item_ids": [],
                "count": 0,
            }
        }


@app.delete("/api/collections/{collection_id}")
def collections_delete(collection_id: int) -> dict:
    with get_connection() as conn:
        conn.execute("DELETE FROM collection_items WHERE collection_id = ?", (collection_id,))
        conn.execute("DELETE FROM collections WHERE id = ?", (collection_id,))
        return {"ok": True}


class CollectionItem(BaseModel):
    item_id: int


@app.post("/api/collections/{collection_id}/items")
def collections_add_item(collection_id: int, body: CollectionItem) -> dict:
    with get_connection() as conn:
        if not conn.execute(
            "SELECT 1 FROM collection_items WHERE collection_id = ? AND item_id = ?",
            (collection_id, body.item_id),
        ).fetchone():
            conn.execute(
                "INSERT INTO collection_items (collection_id, item_id) VALUES (?, ?)",
                (collection_id, body.item_id),
            )
        return {"ok": True}


@app.delete("/api/collections/{collection_id}/items/{item_id}")
def collections_remove_item(collection_id: int, item_id: int) -> dict:
    with get_connection() as conn:
        conn.execute(
            "DELETE FROM collection_items WHERE collection_id = ? AND item_id = ?",
            (collection_id, item_id),
        )
        return {"ok": True}


@app.get("/api/looks")
def looks_list() -> dict:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM looks ORDER BY id DESC").fetchall()
        return {"looks": [_load_look(conn, r) for r in rows]}


class LookCreate(BaseModel):
    title: str
    note: str = ""
    item_ids: list[int] = []


@app.post("/api/looks")
def looks_create(body: LookCreate) -> dict:
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO looks (created_at, title, note, item_ids)
            VALUES (?, ?, ?, ?)
            """,
            (
                date.today().isoformat(),
                body.title or "无题",
                body.note,
                json.dumps(body.item_ids),
            ),
        )
        row = conn.execute(
            "SELECT * FROM looks WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
        return {"look": _load_look(conn, row)}


@app.delete("/api/looks/{look_id}")
def looks_delete(look_id: int) -> dict:
    with get_connection() as conn:
        conn.execute("DELETE FROM looks WHERE id = ?", (look_id,))
        return {"ok": True}


@app.get("/api/ai/recommend")
def ai_recommend(occasion: str = "日常") -> dict:
    with get_connection() as conn:
        return _recommend(conn, occasion)


def _recommend(conn, occasion: str) -> dict:
    """智能搭配：暂未接入前端，保留供后续使用"""
    rows = conn.execute("SELECT * FROM items ORDER BY love_level DESC").fetchall()
    items = [serialize_item(r) for r in rows]
    if not items:
        return {"combo": [], "context": "", "reason": ""}

    pool = list(items)
    random.shuffle(pool)

    def pick(top: str, bottom: Optional[str] = None) -> list[dict]:
        chosen = [i for i in pool if i["category"] == top][:1]
        if bottom:
            chosen += [i for i in pool if i["category"] == bottom][:1]
        if not chosen:
            chosen = pool[:2]
        return chosen

    if occasion in ("约会", "甜系"):
        combo = pick("裙装", "配饰")
    elif occasion == "通勤":
        combo = pick("外套", "上衣")
    else:
        combo = pick("上衣", "裙装")

    if len(combo) < 2:
        combo = (combo + pool)[:2]

    reason = random.choice(
        [
            "奶油色的慵懒午后，温柔又有余韵。",
            "像是被阳光晒过的故事，刚刚好。",
            "把喜欢的两样东西放在一起，总是不会错。",
            "这一套，适合慢慢散步的傍晚。",
        ]
    )
    return {
        "combo": combo,
        "context": f"{occasion} · 今天的风格关键词",
        "reason": reason,
    }
