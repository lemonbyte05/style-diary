from __future__ import annotations

import json
import random
from datetime import date
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection
from seed import seed, serialize_item

app = FastAPI(title="My Style Diary", version="0.2.0")

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
        used = 0
        for o in conn.execute("SELECT item_ids FROM looks").fetchall():
            if item_id in json.loads(o["item_ids"]):
                used += 1
        item["worn_count"] = used
        return {"item": item}


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
