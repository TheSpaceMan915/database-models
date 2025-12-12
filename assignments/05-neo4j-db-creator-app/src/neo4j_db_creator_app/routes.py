# assignments/05-neo4j-db-creator-app/src/neo4j_db_creator_app/routes.py
from __future__ import annotations

import logging
from typing import Any, Dict, List

from neo4j import Driver

logger = logging.getLogger(__name__)


def _build_exact_length_query(length: int) -> str:
    """Build Cypher for an exact-length variable-length path (inject integer literal)."""
    if length < 0:
        raise ValueError("length must be non-negative")
    # Parameterizing the bound is not supported; inject a validated integer literal.
    return (
        "MATCH (s:`A` {Name:$start}) "
        "MATCH (t:`A` {Name:$end}) "
        f"MATCH p = (s)-[* {length}]->(t) "
        "RETURN [n IN nodes(p) | n.Name] AS names, "
        "[r IN relationships(p) | type(r)] AS rels"
    )


def find_routes_exact_length(
    driver: Driver,
    start_label: str,
    start_name: str,
    end_label: str,
    end_name: str,
    length: int,
) -> List[Dict[str, Any]]:
    """Return all routes as dicts: {'names': [...], 'rels': [...]}.
    Labels are fixed to 'A' per the problem, but kept as parameters for clarity.
    """
    if start_label != "A" or end_label != "A":
        logger.warning("Only label 'A' is supported for start/end in this app.")
    cypher = _build_exact_length_query(length)
    params = {"start": start_name, "end": end_name}
    logger.debug("find_routes_exact_length: %s | %s", cypher, params)
    with driver.session() as session:  # type: ignore[call-arg]
        result = session.run(cypher, params)
        rows = result.data()
    # Each row has 'names' and 'rels' arrays
    return [{"names": r["names"], "rels": r["rels"]} for r in rows]


def find_routes_A0_to_A1(driver: Driver, length: int) -> List[Dict[str, Any]]:
    """Public helper: all routes from A0 to A1 with exactly `length` relationships."""
    return find_routes_exact_length(driver, "A", "A0", "A", "A1", length)
