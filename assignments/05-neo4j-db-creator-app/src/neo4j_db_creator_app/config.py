# assignments/05-neo4j-db-creator-app/src/neo4j_db_creator_app/config.py
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Neo4jConfig:
    """Basic connection configuration for Neo4j."""

    uri: str
    user: str
    password: str

    @staticmethod
    def from_env() -> "Neo4jConfig":
        """Load configuration from environment with sensible defaults."""
        return Neo4jConfig(
            uri=os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            user=os.getenv("NEO4J_USER", "neo4j"),
            password=os.getenv("NEO4J_PASSWORD", "neo4j"),
        )
