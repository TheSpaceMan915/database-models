# assignments/05-neo4j-db-creator-app/src/neo4j_db_creator_app/graph_builder.py
from __future__ import annotations

import logging
import random
from dataclasses import dataclass
from typing import Dict, Iterable, List, Mapping, MutableMapping, Sequence, Set, Tuple

from neo4j import Driver

logger = logging.getLogger(__name__)

LABELS: Tuple[str, ...] = ("A", "B", "C", "D", "E", "F")
COUNTS: Mapping[str, int] = {"A": 3, "B": 5, "C": 5, "D": 10, "E": 10, "F": 10}
DEFAULT_PROBS: Mapping[str, float] = {
    "A": 0.15,
    "B": 0.8,
    "C": 0.8,
    "D": 0.01,
    "E": 0.01,
    "F": 0.01,
}


@dataclass(frozen=True)
class NodeRef:
    """Reference to a node by internal id and label/name."""

    id: int
    label: str
    name: str


def ensure_constraints(tx) -> None:
    """Create Name uniqueness constraints for labels A..F (idempotent)."""
    for label in LABELS:
        cypher = f"CREATE CONSTRAINT IF NOT EXISTS FOR (n:`{label}`) REQUIRE n.Name IS UNIQUE"
        logger.debug("ensure_constraints: %s", cypher)
        tx.run(cypher)


def _names_for_label(label: str, count: int) -> List[str]:
    return [f"{label}{i}" for i in range(count)]


def create_nodes(tx) -> None:
    """Create nodes per label (idempotent via MERGE)."""
    for label in LABELS:
        names = _names_for_label(label, COUNTS[label])
        cypher = (
            f"UNWIND $rows AS name "
            f"MERGE (n:`{label}` {{Name: name}}) "
            f"RETURN count(n) AS upserted"
        )
        logger.debug("create_nodes: %s | rows=%s", cypher, names)
        tx.run(cypher, {"rows": names})


def pick_allowed_rel_types(seed: int | None, total_pool: int = 8, pick: int = 4) -> List[str]:
    """Pick exactly `pick` distinct types from REL_1..REL_total_pool (deterministic with seed)."""
    rng = random.Random(seed)
    pool = [f"REL_{i}" for i in range(1, total_pool + 1)]
    chosen = rng.sample(pool, pick)
    logger.debug("Allowed relationship types: %s", chosen)
    return chosen


def _load_nodes_by_label(tx) -> Dict[str, List[NodeRef]]:
    cypher = (
        "MATCH (n) WHERE size(labels(n)) = 1 "
        "RETURN id(n) AS id, labels(n)[0] AS label, n.Name AS name"
    )
    rows = tx.run(cypher).data()
    by_label: Dict[str, List[NodeRef]] = {l: [] for l in LABELS}
    for r in rows:
        label = r["label"]
        if label in by_label:
            by_label[label].append(NodeRef(id=r["id"], label=label, name=r["name"]))
    logger.debug("Loaded nodes by label sizes: %s", {k: len(v) for k, v in by_label.items()})
    return by_label


def stage1_create_random_relationships(tx, probs: Mapping[str, float], allowed_types: Sequence[str], rng: random.Random) -> int:
    """Stage 1: probabilistic cross-label relationship creation."""
    nodes = _load_nodes_by_label(tx)
    rels_by_type: Dict[str, List[Tuple[int, int]]] = {t: [] for t in allowed_types}

    for src_label, src_nodes in nodes.items():
        p = float(probs.get(src_label, 0.0))
        others = [(lbl, lst) for lbl, lst in nodes.items() if lbl != src_label]
        for s in src_nodes:
            for tgt_label, tgt_nodes in others:
                for t in tgt_nodes:
                    if rng.random() < p:
                        rtype = rng.choice(allowed_types)
                        rels_by_type[rtype].append((s.id, t.id))

    created = 0
    for rtype, pairs in rels_by_type.items():
        if not pairs:
            continue
        logger.debug("Stage1 creating %d edges of type %s", len(pairs), rtype)
        cypher = (
            "UNWIND $pairs AS p "
            "MATCH (s) WHERE id(s)=p.src "
            "MATCH (t) WHERE id(t)=p.dst "
            f"MERGE (s)-[:`{rtype}`]->(t)"
        )
        tx.run(cypher, {"pairs": [{"src": s, "dst": d} for s, d in pairs]})
        created += len(pairs)
    logger.info("Stage1 created candidate relationships: %d", created)
    return created


def find_isolated_labels(tx, labels: Sequence[str] | None = None) -> List[str]:
    """Return labels whose nodes have **zero** cross-label degree (to/from other labels)."""
    labels = list(labels or LABELS)
    isolated: List[str] = []
    for label in labels:
        cypher = (
            f"MATCH (n:`{label}`) "
            "WITH n "
            "OPTIONAL MATCH (n)-[]-(m) "
            f"WHERE m IS NOT NULL AND NOT m:`{label}` "
            "WITH n, count(m) AS cross_deg "
            "RETURN sum(CASE WHEN cross_deg=0 THEN 1 ELSE 0 END) AS iso_count, count(n) AS total"
        )
        row = (tx.run(cypher).data() or [{"iso_count": 0, "total": 0}])[0]
        iso_count, total = int(row["iso_count"]), int(row["total"])
        logger.debug("Isolation check %s: iso_count=%d total=%d", label, iso_count, total)
        if total > 0 and iso_count == total:
            isolated.append(label)
    logger.info("Isolated labels: %s", isolated)
    return isolated


def stage2_fix_isolated_labels(tx, allowed_types: Sequence[str], rng: random.Random) -> int:
    """Connect each node of isolated labels to a random node of a non-isolated label."""
    nodes = _load_nodes_by_label(tx)
    isolated = set(find_isolated_labels(tx, LABELS))
    non_isolated = [l for l in LABELS if l not in isolated]

    if not isolated:
        logger.info("No isolated labels to fix.")
        return 0

    # Build target pools per-source-label (must be different label; prefer non-isolated)
    total_created = 0
    rels_by_type: Dict[str, List[Tuple[int, int]]] = {t: [] for t in allowed_types}

    # Prepare a global pool of non-isolated nodes by label
    pool_by_label: Dict[str, List[NodeRef]] = {l: nodes[l] for l in non_isolated}

    for src_label in sorted(isolated):
        src_nodes = nodes[src_label]
        # Candidate target labels: any non-isolated label different from src_label
        target_labels = [l for l in non_isolated if l != src_label]
        if not target_labels:
            # Fallback: if everything is isolated, pick any other label
            target_labels = [l for l in LABELS if l != src_label]

        targets = [n for l in target_labels for n in pool_by_label.get(l, [])]
        if not targets:
            logger.warning("No available targets to fix isolation for label %s", src_label)
            continue

        for s in src_nodes:
            t = rng.choice(targets)
            rtype = rng.choice(allowed_types)
            rels_by_type[rtype].append((s.id, t.id))

    for rtype, pairs in rels_by_type.items():
        if not pairs:
            continue
        logger.debug("Stage2 creating %d edges of type %s", len(pairs), rtype)
        cypher = (
            "UNWIND $pairs AS p "
            "MATCH (s) WHERE id(s)=p.src "
            "MATCH (t) WHERE id(t)=p.dst "
            f"MERGE (s)-[:`{rtype}`]->(t)"
        )
        tx.run(cypher, {"pairs": [{"src": s, "dst": d} for s, d in pairs]})
        total_created += len(pairs)

    logger.info("Stage2 created relationships: %d", total_created)
    return total_created


def create_graph(driver: Driver, probs: Mapping[str, float] | None = None, seed: int | None = None) -> Dict[str, int]:
    """Orchestrate constraints → nodes → Stage1 → Stage2. Returns counts summary."""
    probs = probs or DEFAULT_PROBS
    rng = random.Random(seed)
    allowed = pick_allowed_rel_types(seed)

    with driver.session() as session:  # type: ignore[call-arg]
        session.execute_write(ensure_constraints)
        session.execute_write(create_nodes)

        def _stage1(tx):
            return stage1_create_random_relationships(tx, probs, allowed, rng)

        def _stage2(tx):
            return stage2_fix_isolated_labels(tx, allowed, rng)

        created1: int = session.execute_write(_stage1)
        created2: int = session.execute_write(_stage2)

    summary = {"stage1_created": created1, "stage2_created": created2, "rel_types": len(allowed)}
    logger.info("Graph creation summary: %s (allowed=%s)", summary, allowed)
    return summary
