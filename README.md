# database-models
A curated set of assignment modules demonstrating database modeling across relational, document, and graph paradigms—aimed at students, educators, and developers.

![Repository](https://img.shields.io/badge/repo-TheSpaceMan915%2Fdatabase--models-blue?logo=github)
![Branch](https://img.shields.io/badge/default%20branch-master-blue)
![Languages](https://img.shields.io/badge/JavaScript-97.7%25-yellow?logo=javascript)
![Languages](https://img.shields.io/badge/PLpgSQL-2.3%25-lightgrey)
![Last Commit](https://img.shields.io/github/last-commit/TheSpaceMan915/database-models)
![License](https://img.shields.io/badge/license-TBD-informational)

## Table of Contents
- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Educational Notes](#educational-notes)
  - [Relational](#relational)
  - [Document](#document)
  - [Graph](#graph)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Appendix](#appendix)

## Overview
This repository collects a progression of assignments focused on understanding and practicing data modeling techniques:

- Relational modeling and operations (e.g., Select–Project–Join)
- Document modeling with MongoDB
- Graph modeling with Neo4j

JavaScript (if present) is primarily used for tooling, scripts, or small utilities to set up and interact with the databases. PLpgSQL may appear in relational assignments as stored procedures or functions to demonstrate server-side logic in PostgreSQL. The series is designed to start with fundamentals and build toward more advanced modeling and querying concepts.

## Repository Structure
A high-level view of the repository:

```
database-models/
├─ .gitignore
└─ assignments/
   ├─ 01-spj/
   ├─ 02-data-modelling/
   ├─ 03-rsl-lp-db/
   ├─ 04-mongo-db/
   ├─ 05-neo4j-db-creator-app/
   └─ 06-assessment/
```

- Root files:
  - [.gitignore](https://github.com/TheSpaceMan915/database-models/blob/master/.gitignore)

- Assignments:
  - [01-spj](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/01-spj) — Fundamentals of relational operations (Select, Project, Join).
  - [02-data-modelling](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/02-data-modelling) — Conceptual/logical/physical modeling exercises.
  - [03-rsl-lp-db](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/03-rsl-lp-db) — Relational schema and query language practice (details if present).
  - [04-mongo-db](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/04-mongo-db) — Document modeling with MongoDB (schemas, indexing, queries).
  - [05-neo4j-db-creator-app](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/05-neo4j-db-creator-app) — Graph modeling and database generation with Neo4j.
  - [06-assessment](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/06-assessment) — Capstone or assessment materials.

Explore the top-level assignments directory: [assignments](https://github.com/TheSpaceMan915/database-models/tree/master/assignments)

## Getting Started

### Prerequisites
Install the tools relevant to the assignments you plan to run:
- Node.js and npm (if JavaScript tooling is present)
- PostgreSQL (for PLpgSQL or relational assignments, if applicable)
- MongoDB Community Server (for document assignments)
- Neo4j Desktop or Neo4j Server (for graph assignments)

Optional tools:
- A package manager like `pnpm` or `yarn` (if a `package.json` exists)
- `psql` CLI for PostgreSQL
- `mongosh` or `mongoimport` for MongoDB
- Neo4j Browser and APOC library (if needed)

### Installation
Navigate to the specific assignment folder you want to work on. If a `package.json` exists:

```bash
# from the desired assignment folder
npm install
npm run start
```

Database setup suggestions (adjust per assignment):
- PostgreSQL:
  - Create a local database:
    ```bash
    createdb db_models_dev
    ```
  - Run schema scripts and PLpgSQL functions (if present):
    ```bash
    psql db_models_dev -f ./schema.sql
    psql db_models_dev -f ./functions.sql
    ```
- MongoDB:
  - Start local server and import seed data:
    ```bash
    mongod --dbpath /path/to/db
    # If seeds present:
    mongoimport --db db_models_doc --collection items --file ./seed/items.json --jsonArray
    ```
  - Run Node.js scripts (if applicable):
    ```bash
    node ./scripts/seed.js
    ```
- Neo4j:
  - Create a database in Neo4j Desktop or set up a server database.
  - Install APOC (if needed) and then run the app/tooling (if present):
    ```bash
    # Example environment variables (if required)
    export NEO4J_URI=bolt://localhost:7687
    export NEO4J_USERNAME=neo4j
    export NEO4J_PASSWORD=your_password
    npm run start
    ```

## Usage
- Navigate to an assignment that matches your learning goals:
  - Relational basics: [01-spj](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/01-spj)
  - Modeling workflows: [02-data-modelling](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/02-data-modelling)
  - Relational practice: [03-rsl-lp-db](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/03-rsl-lp-db)
  - Document modeling: [04-mongo-db](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/04-mongo-db)
  - Graph modeling/app: [05-neo4j-db-creator-app](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/05-neo4j-db-creator-app)
  - Capstone/assessment: [06-assessment](https://github.com/TheSpaceMan915/database-models/tree/master/assignments/06-assessment)
- Read the README or instructions in each folder (if present) for assignment-specific steps.
- Typical workflow:
  1. Check for `README.md`, `package.json`, `.env.example`, or `scripts/` directories.
  2. Install dependencies and configure environment variables:
     ```bash
     cp .env.example .env # if present
     # edit .env with local credentials
     ```
  3. Run scripts or start the app:
     ```bash
     npm run start
     # or
     node index.js
     ```
- Expected outputs:
  - SQL query results printed to terminal or persisted in tables.
  - MongoDB scripts inserting or querying documents.
  - Neo4j app generating nodes/relationships and enabling Cypher queries.

## Educational Notes

### Relational
- Key concepts:
  - Normalization (1NF–3NF+), primary/foreign keys, referential integrity
  - Set-based operations: Select, Project, Join, Group By
  - Indexes for performance and query planning
- Recommended resources:
  - PostgreSQL Docs: [SQL Commands](https://www.postgresql.org/docs/current/sql-commands.html)
  - PostgreSQL Docs: [PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html)
  - Use `EXPLAIN` and `EXPLAIN ANALYZE` for performance insights

### Document
- Design strategies:
  - Schema versioning, validation, and indexing
  - Embedding vs referencing trade-offs
  - Optimizing for read/write patterns
- Recommended resources:
  - MongoDB Docs: [Data Modeling](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)
  - MongoDB Docs: [Indexes](https://www.mongodb.com/docs/manual/indexes/)
  - MongoDB University free courses

### Graph
- Modeling patterns:
  - Nodes and relationships with well-defined labels and properties
  - Domain-driven modeling: meaningful relationship types
  - Writing Cypher for traversal and pattern matching
- Recommended resources:
  - Neo4j Docs: [Cypher Query Language](https://neo4j.com/docs/cypher-manual/current/)
  - Neo4j Docs: [Data Modeling](https://neo4j.com/docs/getting-started/data-modeling/)
  - APOC Library: [Overview](https://neo4j.com/docs/apoc/current/)

## Contributing
Contributions are welcome! To propose changes:
1. Open an issue describing your improvement or bug report.
2. Fork the repo and create a feature branch.
3. Make changes with clear commit messages and add/update assignment-level docs.
4. Submit a pull request referencing the issue.

Guidelines:
- Follow consistent folder naming (e.g., `NN-name` with zero-padded numbers).
- If JavaScript tooling is present, consider adding linting (e.g., ESLint) and formatting (Prettier).
- Include sample data and setup instructions for new assignments when applicable.

## License
License: TBD  
If a `LICENSE` file is later added, it will define usage terms for the repository.

## Acknowledgments
- Thanks to instructors, course materials, and the communities behind PostgreSQL, MongoDB, and Neo4j.
- Tools and libraries used in assignments (if present) are credited within their respective folders.

## Appendix

### Troubleshooting
- PostgreSQL:
  - Connection issues: verify `pg_hba.conf` and port (default 5432).
  - Permissions: ensure your role can create schemas/tables/functions.
- MongoDB:
  - `EACCES`/permission errors: check your `dbpath` and user permissions.
  - Import errors: confirm JSON format and use `--jsonArray` when needed.
- Neo4j:
  - Bolt connection failures: verify `NEO4J_URI` and credentials.
  - APOC not found: ensure APOC is installed and enabled in config.

### Example Datasets
- If sample datasets are provided, look for `seed/` or `data/` directories within each assignment.
- Prefer small, well-indexed datasets for query performance exploration.

### Performance Considerations
- Use indexes thoughtfully (relational and document).
- Profile queries:
  - PostgreSQL: `EXPLAIN ANALYZE`
  - MongoDB: `db.collection.aggregate([...])` with `$indexStats`
  - Neo4j: `PROFILE` and `EXPLAIN` in Cypher