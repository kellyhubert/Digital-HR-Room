@echo off
echo Starting Digital HR-Room AI Service...
cd /d "%~dp0ai-service"
call venv\Scripts\activate
python main.py
