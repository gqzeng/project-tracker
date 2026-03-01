#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/backend"
python -c "from alembic.config import main; main(argv=['upgrade', 'head'])"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
