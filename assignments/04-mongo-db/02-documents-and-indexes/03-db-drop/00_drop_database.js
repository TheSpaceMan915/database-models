// assignments/04-mongo-db/02-documents-and-indexes/03-db-drop/00_drop_database.js
use('rsl_lp_db_docs_idx'); const res = db.dropDatabase();
print(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Drop Database
 Database: rsl_lp_db_docs_idx
 Result:   ${tojson(res)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
