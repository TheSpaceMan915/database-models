# assignments/05-neo4j-db-creator-app/tests/test_rel_types.py
from __future__ import annotations

from neo4j_db_creator_app.graph_builder import pick_allowed_rel_types


def test_pick_allowed_rel_types_returns_four_distinct_and_deterministic():
    t1 = pick_allowed_rel_types(seed=42, total_pool=8, pick=4)
    t2 = pick_allowed_rel_types(seed=42, total_pool=8, pick=4)
    assert len(t1) == 4
    assert len(set(t1)) == 4
    assert all(s.startswith("REL_") for s in t1)
    assert t1 == t2  # deterministic with same seed

    # Ensure within pool bounds
    nums = [int(s.split("_")[1]) for s in t1]
    assert all(1 <= n <= 8 for n in nums)
