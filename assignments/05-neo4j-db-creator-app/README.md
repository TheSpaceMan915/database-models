# Neo4j DB Creator App (assignments/05-neo4j-db-creator-app)

A small, production-grade CLI to create a Neo4j graph with labels **A..F**, generate relationships in
two stages (probabilistic + isolation fix), and run **exact-length** path queries (e.g., all routes
from `A0` to `A1` with exactly `N` relationships).

## Features

- Node labels: `A, B, C, D, E, F`
- Counts: `A:3, B:5, C:5, D:10, E:10, F:10`
- Property `Name` per node (e.g., `A0`, `B3`, …)
- Relationship types: pick **exactly 4** at random from `REL_1..REL_8` (reproducible with `--seed`)
- Stage 1 (probabilistic): per-source label probability  
  `A:0.15, B:0.8, C:0.8, D:0.01, E:0.01, F:0.01`
- Stage 2 (isolation fix): for **fully isolated labels** (no cross-label edges at all), connect each
  node to a random node of a non-isolated label using a random allowed relationship type
- Query: **all routes from A0 to A1** with an exact relation count (variable-length path constrained
  to exact length)

## Install

```bash
# From repo root (where pyproject.toml lives)
cd assignments/05-neo4j-db-creator-app
poetry install
```

## Configuration

Environment variables (with sensible defaults):

- `NEO4J_URI` (default `bolt://localhost:7687`)
- `NEO4J_USER` (default `neo4j`)
- `NEO4J_PASSWORD` (default `neo4j`)

You can export them or use a `.env` (if you enable `python-dotenv` in your environment).

## Usage

```bash
# Help
poetry run neo4j-db-creator-app --help

# Create graph (deterministic with --seed)
poetry run neo4j-db-creator-app create-graph --seed 123

# Find all routes from A0 to A1 with exactly 3 relationships
poetry run neo4j-db-creator-app find-routes --length 3
```

## Logging

- Console: `INFO`
- File: `logs/app.log` with rotation (`DEBUG`)

## Architecture

- `neo4j_client.py` – thin wrapper around the official Neo4j driver
- `graph_builder.py` – constraints, node creation, Stage 1/2 relationship creation
- `routes.py` – exact-length route queries
- `cli.py` – argparse-based UI, wiring config + logging
- `logging_config.py` – dictConfig for console + rotating file
- `tests/` – pytest unit tests (driver/session/tx are mocked; no live DB required)

## Cypher notes

- Uniqueness per label:  
  `CREATE CONSTRAINT IF NOT EXISTS FOR (n:A) REQUIRE n.Name IS UNIQUE;` (repeat for B..F)
- Exact-length path example:  
  ```
  MATCH (s:`A` {Name:$start}) MATCH (t:`A` {Name:$end})
  MATCH p = (s)-[* 3]->(t)
  RETURN [n IN nodes(p) | n.Name] AS names,
         [r IN relationships(p) | type(r)] AS rels
  ```

## Troubleshooting

- Check credentials/bolt URI if connection fails.
- Ensure your Neo4j is **5.x** and running with bolt enabled.
- If you reused the DB and want fresh results, wipe it manually or use a new database.

## Tests

```bash
poetry run pytest -q
```
