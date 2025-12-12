# assignments/05-neo4j-db-creator-app/src/neo4j_db_creator_app/cli.py
from __future__ import annotations

import argparse
import json
import logging
import sys
from typing import Any, Dict

from .config import Neo4jConfig
from .exceptions import Neo4jAppError
from .graph_builder import create_graph, DEFAULT_PROBS
from .logging_config import setup_logging
from .neo4j_client import Neo4jClient
from .routes import find_routes_A0_to_A1

logger = logging.getLogger(__name__)


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="neo4j-db-creator-app", description="Create Neo4j graph A..F and run path queries."
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_create = sub.add_parser("create-graph", help="Create nodes/relationships (two-stage).")
    p_create.add_argument("--seed", type=int, default=None, help="Seed for RNG (deterministic).")

    p_routes = sub.add_parser("find-routes", help="Find all routes A0 -> A1 with exact length.")
    p_routes.add_argument("--length", type=int, required=True, help="Exact number of relationships.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    setup_logging()
    cfg = Neo4jConfig.from_env()
    argv = argv if argv is not None else sys.argv[1:]
    args = _parse_args(argv)

    try:
        with Neo4jClient(cfg.uri, cfg.user, cfg.password) as client:
            if args.cmd == "create-graph":
                summary = create_graph(client.driver, DEFAULT_PROBS, seed=args.seed)
                print(json.dumps(summary, indent=2))
                return 0

            if args.cmd == "find-routes":
                paths = find_routes_A0_to_A1(client.driver, length=args.length)
                print(json.dumps({"count": len(paths), "paths": paths}, indent=2))
                return 0

            raise Neo4jAppError("Unknown command.")

    except Neo4jAppError as e:
        logger.error("Application error: %s", e)
        print(f"error: {e}", file=sys.stderr)
        return 2
    except Exception as e:  # noqa: BLE001
        logger.exception("Unhandled error")
        print(f"fatal: {e}", file=sys.stderr)
        return 3
