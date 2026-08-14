from __future__ import annotations

import json
import random
import struct
import uuid
from datetime import date
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import get_connection
from seed import seed, serialize_item, MOODS

GARMENTS_DIR = Path(__file__).parent / "static" / "garments"
GARMENTS_DIR.mkdir(parents=True, exist_ok=True)
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB

app = FastAPI(title="My Style Diary", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def _detect_image_type(data: bytes, ext: str) -> str:
    """自动判断图片类型：带透明通道的 PNG → cutout，其余 → photo"""
    if ext == ".png" and data.startswith(PNG_SIGNATURE) and len(data) >= 33:
        try:
            # IHDR 数据：width(4) height(4) bit_depth(1) color_type(1) ...
            _, _, _, color_type, _, _, _ = struct.unpack(">IIBBBBB", data[16:29])
        except struct.error:
            color_type = None
        if color_type in (4, 6):
            return "cutout"
        if color_type == 3:
            # 索引色 PNG 可能有 tRNS chunk（透明色）
            pos = 8
            while pos + 12 <= len(data):
                length = int.from_bytes(data[pos : pos + 4], "big")
                chunk_type = data[pos + 4 : pos + 8]
                if chunk_type == b"tRNS":
                    return "cutout"
                if chunk_type == b"IEND":
                    break
                pos += 12 + length
        return "photo"
    return "photo"

TODAY_CAPTIONS = [
    "奶油色的慵懒午后，温柔又有余韵。",
    "像是被阳光晒过的故事，刚刚好。",
    "把喜欢的两样东西放在一起，总是不会错。",
    "这一套，适合慢慢散步的傍晚。",
    "穿成自己喜欢的样子，就是最好的天气。",
]


def _today_edit(conn) -> Optional[dict]:
    """Today's Edit：按日期种子稳定挑选主单品+配饰，每天换一套"""
    rows = conn.execute("SELECT * FROM items").fetchall()
    if not rows:
        return None
    items = [serialize_item(r) for r in rows]
    rng = random.Random(date.today().toordinal())
    main_pool = [i for i in items if i["category"] in ("上衣", "裙装", "外套")] or items
    main = rng.choice(main_pool)
    acc_pool = [i for i in items if i["category"] == "配饰"]
    accessory = rng.choice(acc_pool) if acc_pool else None
    return {
        "main": main,
        "accessory": accessory,
        "mood": rng.choice(MOODS),
        "caption": rng.choice(TODAY_CAPTIONS),
        "date": date.today().isoformat(),
    }


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


def _load_wear(conn, row) -> dict:
    return {
        "id": row["id"],
        "date": row["date"],
        "weather": row["weather"],
        "note": row["note"],
        "created_at": row["created_at"],
        "items": _load_items(conn, json.loads(row["item_ids"])),
    }


def _item_usage_count(conn, item_id: int, table: str) -> int:
    rows = conn.execute(f"SELECT item_ids FROM {table}").fetchall()
    return sum(1 for r in rows if item_id in json.loads(r["item_ids"]))


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
            "today_edit": _today_edit(conn),
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
    image_type: Optional[str] = None
    season: str = ""
    brand: str = ""
    material: str = ""
    purchased_at: str = ""
    price: str = ""


@app.post("/api/items")
def items_create(body: ItemCreate) -> dict:
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO items (name, emoji, category, color_hex, tags, story, love_level, image_url, image_type, season, brand, material, purchased_at, price, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                body.name.strip() or "未命名单品",
                body.emoji or "👗",
                body.category,
                body.color_hex,
                json.dumps(body.tags),
                body.story,
                max(1, min(5, body.love_level)),
                body.image_url,
                body.image_type or "photo",
                body.season,
                body.brand,
                body.material,
                body.purchased_at,
                body.price,
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
        raise HTTPException(status_code=400, detail="不支持的图片格式")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="图片超过 10MB 限制")
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="空文件")
    name = f"{uuid.uuid4().hex}{ext}"
    dest = GARMENTS_DIR / name
    dest.write_bytes(data)
    image_type = _detect_image_type(data, ext)
    return {"url": f"/static/garments/{name}", "image_type": image_type}


def _remove_image_file(url: Optional[str]) -> None:
    if not url:
        return
    try:
        path = (Path(__file__).parent / url.lstrip("/")).resolve()
        if str(path).startswith(str(GARMENTS_DIR.resolve())) and path.is_file():
            path.unlink()
    except OSError:
        pass


@app.get("/api/items/{item_id}")
def item_detail(item_id: int) -> dict:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="not_found")
        item = serialize_item(row)
        item["worn_count"] = _item_usage_count(conn, item_id, "wears")
        item["look_count"] = _item_usage_count(conn, item_id, "looks")
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
        old = conn.execute("SELECT image_url FROM items WHERE id = ?", (item_id,)).fetchone()
        if not old:
            raise HTTPException(status_code=404, detail="not_found")
        conn.execute(
            """
            UPDATE items
            SET name=?, emoji=?, category=?, color_hex=?, tags=?, story=?, love_level=?, image_url=?, image_type=?, season=?, brand=?, material=?, purchased_at=?, price=?
            WHERE id=?
            """,
            (
                body.name.strip() or "未命名单品",
                body.emoji or "👗",
                body.category,
                body.color_hex,
                json.dumps(body.tags),
                body.story,
                max(1, min(5, body.love_level)),
                body.image_url,
                body.image_type or "photo",
                body.season,
                body.brand,
                body.material,
                body.purchased_at,
                body.price,
                item_id,
            ),
        )
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
    if old["image_url"] and old["image_url"] != body.image_url:
        _remove_image_file(old["image_url"])
    return {"item": serialize_item(row)}


@app.delete("/api/items/{item_id}")
def items_delete(item_id: int) -> dict:
    with get_connection() as conn:
        row = conn.execute("SELECT image_url FROM items WHERE id = ?", (item_id,)).fetchone()
        conn.execute("DELETE FROM collection_items WHERE item_id = ?", (item_id,))
        for table in ("looks", "wears"):
            for o in conn.execute(f"SELECT id, item_ids FROM {table}").fetchall():
                ids = json.loads(o["item_ids"])
                if item_id in ids:
                    ids.remove(item_id)
                    conn.execute(
                        f"UPDATE {table} SET item_ids = ? WHERE id = ?",
                        (json.dumps(ids), o["id"]),
                    )
        conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
    _remove_image_file(row["image_url"] if row else None)
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
    if not name:
        raise HTTPException(status_code=400, detail="收藏夹名字不能为空")
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
    if not body.item_ids:
        raise HTTPException(status_code=400, detail="搭配至少需要一件单品")
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


@app.get("/api/wears")
def wears_list() -> dict:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM wears ORDER BY date DESC, id DESC").fetchall()
        return {"wears": [_load_wear(conn, r) for r in rows]}


class WearCreate(BaseModel):
    date: Optional[str] = None
    item_ids: list[int] = []
    weather: str = ""
    note: str = ""


@app.post("/api/wears")
def wears_create(body: WearCreate) -> dict:
    if not body.item_ids:
        raise HTTPException(status_code=400, detail="穿搭记录至少需要一件单品")
    day = body.date or date.today().isoformat()
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO wears (date, item_ids, weather, note, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (day, json.dumps(body.item_ids), body.weather, body.note, date.today().isoformat()),
        )
        row = conn.execute("SELECT * FROM wears WHERE id = ?", (cur.lastrowid,)).fetchone()
        return {"wear": _load_wear(conn, row)}


@app.delete("/api/wears/{wear_id}")
def wears_delete(wear_id: int) -> dict:
    with get_connection() as conn:
        conn.execute("DELETE FROM wears WHERE id = ?", (wear_id,))
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
