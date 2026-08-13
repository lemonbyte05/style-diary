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

            CREATE TABLE IF NOT EXISTS looks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                title TEXT NOT NULL,
                note TEXT DEFAULT '',
                item_ids TEXT NOT NULL DEFAULT '[]'
            );

            DROP TABLE IF EXISTS outfits;
            DROP TABLE IF EXISTS saved_looks;
            """
        )
