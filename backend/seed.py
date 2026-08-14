from __future__ import annotations

import json
import random
from datetime import date, timedelta
from typing import Any

from database import get_connection, init_db

MOODS = [
    {"emoji": "🎀", "word": "很温柔", "note": "想慢慢生活"},
    {"emoji": "☀", "word": "很明亮", "note": "今天也要发光"},
    {"emoji": "🌧", "word": "有点慵懒", "note": "窝着也很好"},
    {"emoji": "✨", "word": "很开心", "note": "心情是粉色的"},
]

STYLE_KEYWORDS = ["甜系", "奶油色", "约会", "OOTD"]

ITEMS = [
    {
        "name": "白色蕾丝初恋裙",
        "emoji": "👗",
        "category": "裙装",
        "color_hex": "#F3E9F2",
        "tags": ["甜系", "约会", "白色", "连衣裙"],
        "story": "买它的那天，阳光很好，路过花店给自己买了一支玫瑰。",
        "love_level": 5,
    },
    {
        "name": "奶油针织开衫",
        "emoji": "🧶",
        "category": "上衣",
        "color_hex": "#F1E3C8",
        "tags": ["温柔", "奶油色", "春秋", "开衫"],
        "story": "奶奶说我穿它像一块小蛋糕。",
        "love_level": 4,
    },
    {
        "name": "香芋紫短毛衣",
        "emoji": "🧶",
        "category": "上衣",
        "color_hex": "#DDD0E8",
        "tags": ["温柔", "香芋紫", "秋天"],
        "story": "去年秋天在巷口小店淘到的，店主说很适合我。",
        "love_level": 4,
    },
    {
        "name": "雾蓝百褶半裙",
        "emoji": "👗",
        "category": "裙装",
        "color_hex": "#CFDCE8",
        "tags": ["清爽", "雾霾蓝", "学院", "半裙"],
        "story": "裙摆转起来的时候，像风里的一片云。",
        "love_level": 3,
    },
    {
        "name": "蜜桃色吊带",
        "emoji": "👙",
        "category": "上衣",
        "color_hex": "#F2CFC0",
        "tags": ["甜系", "蜜桃", "夏天"],
        "story": "为了它才鼓起勇气露肩膀的夏天。",
        "love_level": 5,
    },
    {
        "name": "杏色长风衣",
        "emoji": "🧥",
        "category": "外套",
        "color_hex": "#E8D9C4",
        "tags": ["法式", "杏色", "秋天", "外套"],
        "story": "风衣是秋天的信笺，我是收信人。",
        "love_level": 4,
    },
    {
        "name": "灰蓝针织连衣裙",
        "emoji": "👗",
        "category": "裙装",
        "color_hex": "#C9D4DE",
        "tags": ["温柔", "灰蓝", "冬日", "连衣裙"],
        "story": "冬天穿上它，像是把自己裹进被子里。",
        "love_level": 4,
    },
    {
        "name": "奶油白手袋",
        "emoji": "👜",
        "category": "配饰",
        "color_hex": "#F4EDE0",
        "tags": ["奶油色", "通勤", "配饰"],
        "story": "里面装着口红、护手霜和一颗糖。",
        "love_level": 3,
    },
    {
        "name": "燕麦色围巾",
        "emoji": "🧣",
        "category": "配饰",
        "color_hex": "#E5DCCB",
        "tags": ["秋冬", "燕麦色", "配饰"],
        "story": "它的温度，刚好是拥抱的温度。",
        "love_level": 3,
    },
    {
        "name": "鼠尾草绿衬衫",
        "emoji": "👕",
        "category": "上衣",
        "color_hex": "#CBD6C4",
        "tags": ["清爽", "鼠尾草绿", "通勤", "衬衫"],
        "story": "第一次觉得绿色也能这么温柔。",
        "love_level": 4,
    },
]


def seed() -> None:
    init_db()
    with get_connection() as conn:
        count = conn.execute("SELECT COUNT(*) AS c FROM items").fetchone()["c"]
        if count == 0:
            for item in ITEMS:
                conn.execute(
                    """
                    INSERT INTO items (name, emoji, category, color_hex, tags, story, love_level, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        item["name"],
                        item["emoji"],
                        item["category"],
                        item["color_hex"],
                        json.dumps(item["tags"], ensure_ascii=False),
                        item["story"],
                        item["love_level"],
                        (date.today() - timedelta(days=random.randint(1, 400))).isoformat(),
                    ),
                )


def serialize_item(row: Any) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "emoji": row["emoji"],
        "category": row["category"],
        "color_hex": row["color_hex"],
        "tags": json.loads(row["tags"]),
        "story": row["story"],
        "love_level": row["love_level"],
        "image_url": row["image_url"],
        "image_type": row["image_type"],
        "created_at": row["created_at"],
    }
