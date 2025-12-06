// assignments/04-mongo-db/05-regular-expressions/02-queries/03_regex_complex_pattern_search.js

// How to run:
//   mongosh assignments/04-mongo-db/05-regular-expressions/02-queries/03_regex_complex_pattern_search.js
// Demonstrates complex templates: alternation, groups, classes, and logical NOT via $not.

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

// 1) Lessons named like "Lesson 01:", "Lesson 1A:", "Lesson 12:".
// Pattern: /^Lesson\s+(?:\d{1,2}|[0-9][A-Z]):\s*/
header('Complex lesson pattern: /^Lesson\\s+(?:\\d{1,2}|[0-9][A-Z]):\\s*/');
const complexLessonPattern = /^Lesson\s+(?:\d{1,2}|[0-9][A-Z]):\s*/;
const lessonFilter = { name: { $regex: complexLessonPattern } };
const lessonResults = db.lesson.find(lessonFilter, { projection: { _id: 1, name: 1 } }).toArray();
showResults(lessonResults);
explainSummary(db.lesson, lessonFilter);

// 2) Modules matching either "Advanced ..." or "Alphabet ..." — /^(Advanced|Alphabet)\b/i
header('Modules matching /^(Advanced|Alphabet)\\b/i');
const modulePattern = /^(Advanced|Alphabet)\b/i;
const moduleFilter = { name: { $regex: modulePattern } };
const moduleResults = db.module.find(moduleFilter, { projection: { _id: 1, name: 1 } }).toArray();
showResults(moduleResults);
explainSummary(db.module, moduleFilter);

// 3) Steps whose names do NOT include the word "Intro"
// Using logical NOT with $not (note: negated regex cannot use index and may scan)
header('Steps NOT containing "Intro" (negated regex via $not)');
const stepFilter = { name: { $not: /Intro/i } };
const stepResults = db.step.find(stepFilter, { projection: { _id: 1, name: 1 } }).limit(10).toArray();
showResults(stepResults);
explainSummary(db.step, stepFilter);

// Optional: collation example for case sensitivity differences (exact match vs case-insensitive)
// This shows how collation affects string comparison (not regex flags).
header('Optional: Collation example (case sensitive exact match on modules)');
const csExact = db.module.find(
  { name: 'Alphabet Basics' },
  { projection: { _id: 1, name: 1 }, collation: { locale: 'en', strength: 3 } } // case sensitive
).toArray();
printjson(csExact);

print('\n[RATIONALE] Alternation and groups let you express templates; $not excludes matches.');
print('[TIP] Left-anchored complex patterns can still benefit from name indexes.');
print('[OK] Complex regex examples complete.');