// assignments/04-mongo-db/05-regular-expressions/02-queries/01_regex_prefix_search.js

// How to run:
//   mongosh assignments/04-mongo-db/05-regular-expressions/02-queries/01_regex_prefix_search.js
// Demonstrates left-anchored prefix regex queries. These can use btree indexes on name fields.

use('rsl_lp_db_regex');

function header(t) { print(`\n=== ${t} ===`); }
function showResults(cursor) {
  printjson(cursor.map(d => ({ _id: d._id, name: d.name })));
}
function explainSummary(coll, filter) {
  const plan = coll.explain('executionStats').find(filter);
  const stats = plan.executionStats;
  // Print minimal summary: nReturned and totalDocsExamined to highlight IXSCAN vs COLLSCAN
  print(`explain — nReturned: ${stats.nReturned}, totalDocsExamined: ${stats.totalDocsExamined}`);
  const stages = JSON.stringify(plan.queryPlanner.winningPlan);
  print(`winningPlan: ${stages}`);
}

// 1) Modules with names starting with "Basic" — /^Basic/i
header('Modules with names starting with "Basic" (prefix, case-insensitive)');
const modFilter = { name: { $regex: /^Basic/i } };
const modResults = db.module.find(modFilter, { projection: { _id: 1, name: 1 } }).toArray();
showResults(modResults);
explainSummary(db.module, modFilter);

// 2) Lessons starting with "Lesson 0" — /^Lesson 0/i
header('Lessons with names starting with "Lesson 0"');
const lessonFilter0 = { name: { $regex: /^Lesson 0/i } };
const lessonResults0 = db.lesson.find(lessonFilter0, { projection: { _id: 1, name: 1 } }).toArray();
showResults(lessonResults0);
explainSummary(db.lesson, lessonFilter0);

// 3) Lessons starting with "Lesson 1" — /^Lesson 1/i
header('Lessons with names starting with "Lesson 1"');
const lessonFilter1 = { name: { $regex: /^Lesson 1/i } };
const lessonResults1 = db.lesson.find(lessonFilter1, { projection: { _id: 1, name: 1 } }).toArray();
showResults(lessonResults1);
explainSummary(db.lesson, lessonFilter1);

print('\n[NOTE] Left-anchored regex (e.g., /^Basic/i) can leverage indexes; leading ".*" prevents index use.');
print('[OK] Prefix regex examples complete.');