#!/bin/bash
export PYTHONPATH=$PYTHONPATH:.
export ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
uvicorn backend.main:app --reload --port 8000
