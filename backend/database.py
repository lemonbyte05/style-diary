import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "wardrobe.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
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
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS outfits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                title TEXT NOT NULL,
                mood TEXT NOT NULL,
                weather TEXT DEFAULT '晴',
                occasion TEXT DEFAULT '日常',
                note TEXT DEFAULT '',
                item_ids TEXT NOT NULL DEFAULT '[]'
            );

            CREATE TABLE IF NOT EXISTS saved_looks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                main_item_id INTEGER,
                second_item_id INTEGER,
                reason TEXT DEFAULT '',
                context TEXT DEFAULT ''
            );
            """
        )
