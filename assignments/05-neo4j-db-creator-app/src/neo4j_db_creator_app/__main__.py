# assignments/05-neo4j-db-creator-app/src/neo4j_db_creator_app/__main__.py
# Allow `python -m neo4j_db_creator_app` to run the CLI.
from __future__ import annotations

from .cli import main

if __name__ == "__main__":
    raise SystemExit(main())
