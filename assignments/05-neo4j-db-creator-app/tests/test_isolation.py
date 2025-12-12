# assignments/05-neo4j-db-creator-app/tests/test_isolation.py
from __future__ import annotations

import re

from neo4j_db_creator_app.graph_builder import find_isolated_labels


class _FakeRunResult:
    def __init__(self, iso_count: int, total: int) -> None:
        self._iso_count = iso_count
        self._total = total

    def data(self):
        return [{"iso_count": self._iso_count, "total": self._total}]


class _FakeTx:
    def __init__(self, mapping):
        self.mapping = mapping  # label -> (iso_count, total)

    def run(self, cypher: str):
        m = re.search(r"MATCH \(n:`([A-F])`\)", cypher)
        label = m.group(1) if m else "A"
        iso, tot = self.mapping.get(label, (0, 0))
        return _FakeRunResult(iso, tot)


def test_find_isolated_labels_detects_expected():
    # A isolated (3/3), B not isolated (4/5), C absent (0/0) -> only A
    tx = _FakeTx({"A": (3, 3), "B": (1, 5), "C": (0, 0)})
    out = find_isolated_labels(tx, labels=["A", "B", "C"])
    assert out == ["A"]
