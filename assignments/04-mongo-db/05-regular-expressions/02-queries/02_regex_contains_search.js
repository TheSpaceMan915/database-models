// assignments/04-mongo-db/05-regular-expressions/02-queries/02_regex_contains_search.js

// How to run:
//   mongosh assignments/04-mongo-db/05-regular-expressions/02-queries/02_regex_contains_search.js
// Demonstrates non-anchored substring regex queries. Typically results in COLLSCAN.

use('rsl_lp_db_regex');

function header(t) { print(`\n=== ${t} ===`); }
function showResults(cursor) {
  printjson(cursor.map(d => ({ _id: d._id, name: d.name })));
}
function explainSummary(coll, filter) {
  const plan = coll.explain('executionStats').find(filter);
  const stats = plan.executionStats;
  print(`explain — nReturned: ${stats.nReturned}, totalDocsExamined: ${stats.totalDocsExamined}`);
  const stages = JSON.stringify(plan.queryPlanner.winningPlan);
  print(`winningPlan: ${stages}`);
}

// 1) Modules whose name contains "log" (e.g., "Dialogues") — /log/i
header('Modules whose name contains "log" anywhere (substring)');
const modFilter = { name: { $regex: /log/i } };
const modResults = db.module.find(modFilter, { projection: { _id: 1, name: 1 } }).toArray();
showResults(modResults);
explainSummary(db.module, modFilter);

// 2) Steps whose name contains "Step 2" anywhere — /Step\s*2/i
header('Steps whose name contains "Step 2" (with optional space)');
const stepFilter = { name: { $regex: /Step\s*2/i } };
const stepResults = db.step.find(stepFilter, { projection: { _id: 1, name: 1 } }).limit(10).toArray();
showResults(stepResults);
explainSummary(db.step, stepFilter);

print('\n[CAUTION] Non-anchored substrings often perform COLLSCAN. Prefer anchors or consider Atlas Search/n-grams.');
print('[OK] Contains regex examples complete.');