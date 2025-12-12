# assignments/05-neo4j-db-creator-app/src/neo4j_db_creator_app/neo4j_client.py
from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from neo4j import GraphDatabase, Driver, Session, Result

logger = logging.getLogger(__name__)


class Neo4jClient:
    """Thin wrapper around the official Neo4j driver."""

    def __init__(self, uri: str, user: str, password: str) -> None:
        self._driver: Driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self) -> None:
        self._driver.close()

    def __enter__(self) -> "Neo4jClient":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    @property
    def driver(self) -> Driver:
        return self._driver

    def run(self, cypher: str, params: Optional[Dict[str, Any]] = None) -> Result:
        """Open a session, run the query, return the Result."""
        logger.debug("Cypher RUN: %s | params=%s", cypher, params)
        with self._driver.session() as session:  # type: ignore[call-arg]
            return session.run(cypher, params or {})
