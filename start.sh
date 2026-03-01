#!/usr/bin/env bash
set -e
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT/backend"
# Strip '' and '.' from sys.path so backend/alembic/ doesn't shadow the installed alembic package
python -c "
import sys
sys.path = [p for p in sys.path if p not in ('', '.')]
from alembic.config import main
main(argv=['upgrade', 'head'])
"
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
