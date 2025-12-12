# assignments/05-neo4j-db-creator-app/src/neo4j_db_creator_app/exceptions.py
from __future__ import annotations


class Neo4jAppError(Exception):
    """Base application error."""


class ConfigError(Neo4jAppError):
    """Configuration error."""


class GraphBuildError(Neo4jAppError):
    """Graph creation failure."""
