# assignments/05-neo4j-db-creator-app/src/neo4j_db_creator_app/logging_config.py
from __future__ import annotations

import logging
import logging.config
import os
from logging.handlers import RotatingFileHandler
from typing import Dict, Any


def _ensure_log_dir(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)


def build_logging_config(log_file: str = "logs/app.log") -> Dict[str, Any]:
    """Return a dictConfig for console (INFO) + rotating file (DEBUG)."""
    _ensure_log_dir(log_file)
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "console": {"format": "%(levelname)s | %(name)s | %(message)s"},
            "file": {
                "format": (
                    "%(asctime)s | %(levelname)s | %(name)s | %(funcName)s:%(lineno)d | %(message)s"
                )
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "INFO",
                "formatter": "console",
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "DEBUG",
                "formatter": "file",
                "filename": log_file,
                "maxBytes": 1_000_000,
                "backupCount": 3,
                "encoding": "utf-8",
            },
        },
        "root": {"level": "DEBUG", "handlers": ["console", "file"]},
    }


def setup_logging() -> None:
    """Apply default logging configuration."""
    logging.config.dictConfig(build_logging_config())
