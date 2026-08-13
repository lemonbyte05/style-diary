@echo off
title My Style Diary
echo ============================================
echo   My Style Diary - 个人时尚收藏档案
echo ============================================
echo.

echo [1/3] 启动后端 (FastAPI :8000) ...
start "MSD-Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --port 8000"

echo [2/3] 启动前端 (Vite :5173) ...
start "MSD-Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] 打开浏览器 ...
timeout /t 6 /nobreak >nul
start http://127.0.0.1:5173

echo.
echo 已启动。关闭对应窗口即可停止服务。
