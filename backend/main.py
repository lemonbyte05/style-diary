from __future__ import annotations

import json
import random
from datetime import date
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection
from seed import MOODS, STYLE_KEYWORDS, seed, serialize_item

app = FastAPI(title="My Style Diary", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_items(conn, ids: list[int]) -> list[dict]:
    if not ids:
        return []
    placeholders = ",".join("?" for _ in ids)
    rows = conn.execute(
        f"SELECT * FROM items WHERE id IN ({placeholders})", ids
    ).fetchall()
    by_id = {r["id"]: serialize_item(r) for r in rows}
    return [by_id[i] for i in ids if i in by_id]


def _load_outfit(conn, row) -> dict:
    return {
        "id": row["id"],
        "date": row["date"],
        "title": row["title"],
        "mood": row["mood"],
        "weather": row["weather"],
        "occasion": row["occasion"],
        "note": row["note"],
        "items": _load_items(conn, json.loads(row["item_ids"])),
    }


@app.on_event("startup")
def on_startup() -> None:
    seed()


@app.get("/api/home")
def home() -> dict:
    with get_connection() as conn:
        today = date.today().isoformat()
        outfit_row = conn.execute(
            "SELECT * FROM outfits ORDER BY ABS(julianday(date) - julianday(?)) LIMIT 1",
            (today,),
        ).fetchone()
        outfit = _load_outfit(conn, outfit_row) if outfit_row else None

        items = [serialize_item(r) for r in conn.execute(
            "SELECT * FROM items ORDER BY id DESC"
        ).fetchall()]
        recent = items[:6]

        rec = _recommend(conn, occasion=outfit["occasion"] if outfit else "日常")
        return {
            "masthead": {
                "vol": 24,
                "date": today,
                "month": f"{date.today().month}月",
                "day": date.today().day,
            },
            "mood": MOODS[0],
            "today_outfit": outfit,
            "style_keywords": STYLE_KEYWORDS,
            "recent_collections": recent,
            "ai_recommendation": rec,
        }


@app.get("/api/items")
def items(category: Optional[str] = None) -> dict:
    with get_connection() as conn:
        if category and category != "全部":
            rows = conn.execute(
                "SELECT * FROM items WHERE category = ? ORDER BY love_level DESC, id ASC",
                (category,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM items ORDER BY love_level DESC, id ASC"
            ).fetchall()
        return {"items": [serialize_item(r) for r in rows]}


@app.get("/api/items/{item_id}")
def item_detail(item_id: int) -> dict:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if not row:
            return {"error": "not_found"}
        item = serialize_item(row)
        outfit_count = 0
        for o in conn.execute("SELECT item_ids FROM outfits").fetchall():
            if item_id in json.loads(o["item_ids"]):
                outfit_count += 1
        item["worn_count"] = outfit_count
        return {"item": item}


@app.get("/api/ai/recommend")
def ai_recommend(occasion: str = "日常") -> dict:
    with get_connection() as conn:
        return _recommend(conn, occasion)


@app.get("/api/outfits")
def outfits_list() -> dict:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM outfits ORDER BY date DESC").fetchall()
        return {"outfits": [_load_outfit(conn, r) for r in rows]}


@app.get("/api/growth")
def growth() -> dict:
    with get_connection() as conn:
        items = [serialize_item(r) for r in conn.execute("SELECT * FROM items").fetchall()]
        outfit_rows = conn.execute("SELECT * FROM outfits ORDER BY date ASC").fetchall()
        today = date.today()

        age_days = 1
        if items:
            first = min(i["created_at"] for i in items)
            try:
                age_days = max((today - date.fromisoformat(first)).days, 1)
            except ValueError:
                pass

        worn: dict[int, int] = {}
        for o in outfit_rows:
            for iid in json.loads(o["item_ids"]):
                worn[iid] = worn.get(iid, 0) + 1
        by_id = {i["id"]: i for i in items}
        most_worn = [
            {**by_id[iid], "worn": c}
            for iid, c in sorted(worn.items(), key=lambda kv: -kv[1])[:4]
            if iid in by_id
        ]

        kw: dict[str, int] = {}
        for i in items:
            for t in i["tags"]:
                kw[t] = kw.get(t, 0) + 1
        style_keywords = [
            {"label": k, "count": v} for k, v in sorted(kw.items(), key=lambda kv: -kv[1])[:6]
        ]

        monthly: dict[str, int] = {}
        for o in outfit_rows:
            m = o["date"][:7]
            monthly[m] = monthly.get(m, 0) + 1

        favorites = [
            _load_outfit(conn, r)
            for r in conn.execute("SELECT * FROM outfits ORDER BY date DESC LIMIT 4").fetchall()
        ]

        return {
            "total_items": len(items),
            "age_days": age_days,
            "worn_total": len(outfit_rows),
            "most_worn": most_worn,
            "style_keywords": style_keywords,
            "monthly": [{"month": m, "count": c} for m, c in sorted(monthly.items())],
            "favorites": favorites,
        }


class AiRequest(BaseModel):
    occasion: str = "日常"


def _recommend(conn, occasion: str) -> dict:
    rows = conn.execute("SELECT * FROM items ORDER BY love_level DESC").fetchall()
    items = [serialize_item(r) for r in rows]
    if not items:
        return {"combo": [], "context": "", "reason": ""}

    pool = list(items)
    random.shuffle(pool)

    def pick(top: str, bottom: str | None = None) -> list[dict]:
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

    names = " × ".join(i["name"] for i in combo)
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
