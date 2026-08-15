import re
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "wardrobe.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # 并发写入稳健性：WAL 模式 + 写锁等待
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                emoji TEXT DEFAULT '👗',
                category TEXT NOT NULL,
                color_hex TEXT NOT NULL,
                tags TEXT NOT NULL DEFAULT '[]',
                story TEXT DEFAULT '',
                love_level INTEGER DEFAULT 3,
                image_url TEXT,
                image_type TEXT DEFAULT 'photo',
                season TEXT DEFAULT '',
                brand TEXT DEFAULT '',
                material TEXT DEFAULT '',
                purchased_at TEXT DEFAULT '',
                price TEXT DEFAULT '',
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS looks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                title TEXT NOT NULL,
                note TEXT DEFAULT '',
                item_ids TEXT NOT NULL DEFAULT '[]',
                inspiration_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS inspirations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_url TEXT NOT NULL,
                tags TEXT NOT NULL DEFAULT '[]',
                note TEXT DEFAULT '',
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS collections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS collection_items (
                collection_id INTEGER NOT NULL,
                item_id INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS wears (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                item_ids TEXT NOT NULL DEFAULT '[]',
                weather TEXT DEFAULT '',
                note TEXT DEFAULT '',
                created_at TEXT NOT NULL
            );

            DROP TABLE IF EXISTS outfits;
            DROP TABLE IF EXISTS saved_looks;
            """
        )
        # 迁移：老库补 image_url / image_type 列
        cols = [r["name"] for r in conn.execute("PRAGMA table_info(items)").fetchall()]
        if "image_url" not in cols:
            conn.execute("ALTER TABLE items ADD COLUMN image_url TEXT")
        if "image_type" not in cols:
            conn.execute("ALTER TABLE items ADD COLUMN image_type TEXT DEFAULT 'photo'")
        for col, default in (("season", ""), ("brand", ""), ("material", ""), ("purchased_at", ""), ("price", "")):
            if col not in cols:
                conn.execute(f"ALTER TABLE items ADD COLUMN {col} TEXT DEFAULT '{default}'")
        # 迁移：老库补 looks.inspiration_id
        look_cols = [r["name"] for r in conn.execute("PRAGMA table_info(looks)").fetchall()]
        if "inspiration_id" not in look_cols:
            conn.execute("ALTER TABLE looks ADD COLUMN inspiration_id INTEGER")
        # 迁移：历史默认占位标题 → 自动编号 LOOK N（真实标题不动）
        _migrate_look_titles(conn)


def _migrate_look_titles(conn) -> None:
    placeholders = {
        "无题", "未命名", "未命名的搭配", "未命名穿搭",
        "untitled", "untitled look", "untitled item", "",
    }
    rows = conn.execute("SELECT id, title FROM looks ORDER BY created_at, id").fetchall()
    used = set()
    for r in rows:
        m = re.fullmatch(r"LOOK\s+(\d+)", (r["title"] or "").strip(), re.IGNORECASE)
        if m:
            used.add(int(m.group(1)))
    n = 1
    for r in rows:
        t = (r["title"] or "").strip()
        if t.lower() in placeholders:
            while n in used:
                n += 1
            used.add(n)
            conn.execute(
                "UPDATE looks SET title = ? WHERE id = ?", (f"LOOK {n}", r["id"])
            )
