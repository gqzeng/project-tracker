#!/usr/bin/env bash
set -e
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$REPO_ROOT/.venv/bin/activate"
cd "$REPO_ROOT/backend"
python -c "from alembic.config import main; main(argv=['upgrade', 'head'])"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
