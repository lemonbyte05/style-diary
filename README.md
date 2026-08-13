# My Style Diary 个人时尚收藏档案

不是衣服管理工具，而是「个人时尚收藏档案」——像一本属于自己的时尚杂志和成长日记。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React + TypeScript + Tailwind CSS |
| 动画 | Framer Motion |
| 图标 | Lucide React |
| 后端 | FastAPI |
| 数据库 | SQLite |

## 快速开始

一键启动（Windows）：

```
start.bat
```

或手动分步：

```bash
# 后端 (http://127.0.0.1:8000)
cd backend
pip install -r requirements.txt -i https://pypi.org/simple
python -m uvicorn main:app --port 8000

# 前端 (http://127.0.0.1:5173)
cd frontend
npm install
npm run dev
```

浏览器访问：http://127.0.0.1:5173

## 当前页面（第一阶段）

- `/` 首页 My Style Diary（心情 · 今日穿搭 · 风格关键词 · 最近收藏 · AI 灵感）
- `/wardrobe` 衣橱展示页（搜索 · 分类筛选 · 拍立得墙）
- `/item/:id` 衣服详情页（藏品卡 · 它的故事 · 星级）

## 设计系统

Romantic Editorial Scrapbook —— 纸面世界观。

- **色彩**：燕麦纸 `#F6F1E8` 基底、可可墨 `#332C25` 文字、干枯玫瑰 `#C98A7A` 点缀（用量 ≤10%）
- **字体**：衬线（Songti/Noto Serif）题字 + 无衬线正文 + 手写体点缀
- **圆角**：小 4 / 中 12 / 大 20 / 英雄 28 / 胶囊 999
- **阴影**：暖墨色低透明度，默认平贴、仅主角浮起
- **卡片**：拍立得 / 索引卡 / 票根卡 / 封面卡 / 章页卡

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/home` | 首页聚合数据 |
| GET | `/api/items` | 单品列表（`?category=`） |
| GET | `/api/items/:id` | 单品详情 |
| GET | `/api/ai/recommend` | AI 搭配灵感 |
