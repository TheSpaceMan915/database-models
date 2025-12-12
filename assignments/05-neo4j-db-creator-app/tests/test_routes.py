# assignments/05-neo4j-db-creator-app/tests/test_routes.py
from __future__ import annotations

from unittest.mock import MagicMock

from neo4j_db_creator_app.routes import _build_exact_length_query, find_routes_A0_to_A1


def test_build_exact_length_query_literal_injection():
    q = _build_exact_length_query(3)
    assert "* 3" in q
    assert "$len" not in q


def test_find_routes_calls_neo4j_with_expected_cypher_and_params():
    # Arrange driver/session mocks
    fake_result = MagicMock()
    fake_result.data.return_value = [
        {"names": ["A0", "B1", "A1"], "rels": ["REL_1", "REL_2"]},
        {"names": ["A0", "C0", "B0", "A1"], "rels": ["REL_3", "REL_1", "REL_2"]},
    ]

    fake_session = MagicMock()
    fake_session.run.return_value = fake_result
    fake_driver = MagicMock()
    # session() context manager behavior
    fake_driver.session.return_value.__enter__.return_value = fake_session

    # Act
    paths = find_routes_A0_to_A1(fake_driver, length=3)

    # Assert
    assert len(paths) == 2
    cypher_used = fake_session.run.call_args[0][0]
    params_used = fake_session.run.call_args[0][1]
    assert "* 3" in cypher_used
    assert params_used == {"start": "A0", "end": "A1"}
    assert paths[0]["names"][0] == "A0"
