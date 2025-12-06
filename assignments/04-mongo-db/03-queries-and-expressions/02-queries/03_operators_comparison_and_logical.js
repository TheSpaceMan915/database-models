// assignments/04-mongo-db/03-queries-and-expressions/02-queries/03_operators_comparison_and_logical.js

// How to run:
//   mongosh assignments/04-mongo-db/03-queries-and-expressions/02-queries/03_operators_comparison_and_logical.js
// Demonstrates comparison/logical operators: $lt, $lte, $gt, $gte, $ne, $in, $nin, $not (with regex).
// Uses step.order_index and timestamps for examples.

use('rsl_lp_db_queries_expr');

function printHeader(title) {
  print(`\n=== ${title} ===`);
}
function printCount(name, cursorOrArray) {
  const count = Array.isArray(cursorOrArray) ? cursorOrArray.length : cursorOrArray.count();
  print(`${name} count: ${count}`);
}

// $lt, $lte on order_index
printHeader('Steps with order_index < 3');
const stepsLt3 = db.step.find(
  { order_index: { $lt: 3 } },
  { projection: { _id: 0, name: 1, order_index: 1 } }
).limit(5).toArray();
printjson(stepsLt3);
print(`Matched: ${stepsLt3.length}`);

printHeader('Steps with order_index <= 2');
const stepsLte2 = db.step.find(
  { order_index: { $lte: 2 } },
  { projection: { _id: 0, name: 1, order_index: 1 } }
).limit(5).toArray();
printjson(stepsLte2);
print(`Matched: ${stepsLte2.length}`);

// $gt, $gte on order_index
printHeader('Steps with order_index > 2');
const stepsGt2 = db.step.find(
  { order_index: { $gt: 2 } },
  { projection: { _id: 0, name: 1, order_index: 1 } }
).limit(5).toArray();
printjson(stepsGt2);
print(`Matched: ${stepsGt2.length}`);

printHeader('Steps with order_index >= 3');
const stepsGte3 = db.step.find(
  { order_index: { $gte: 3 } },
  { projection: { _id: 0, name: 1, order_index: 1 } }
).limit(5).toArray();
printjson(stepsGte3);
print(`Matched: ${stepsGte3.length}`);

// $ne: not equal to a specific status or name
printHeader('Modules where name != "Alphabet"');
const modulesNeAlphabet = db.module.find(
  { name: { $ne: 'Alphabet' } },
  { projection: { _id: 0, name: 1 } }
).toArray();
printjson(modulesNeAlphabet);
print(`Matched: ${modulesNeAlphabet.length}`);

printHeader('Lesson progress not equal to "completed"');
const completedStatus = db.status.findOne({ name: 'completed' });
const notCompletedProgress = db.person_lesson_progress.find(
  { status_id: { $ne: completedStatus._id } },
  { projection: { _id: 0, lesson_id: 1, status_id: 1 } }
).limit(5).toArray();
printjson(notCompletedProgress);
print(`Matched: ${notCompletedProgress.length}`);

// $in, $nin: membership tests
printHeader('Lessons whose _id is in a given set');
const someLessons = db.lesson.find({}, { projection: { _id: 1, name: 1 } }).limit(3).toArray();
const lessonIdSet = someLessons.map(l => l._id);
const lessonsInIds = db.lesson.find(
  { _id: { $in: lessonIdSet } },
  { projection: { _id: 0, name: 1 } }
).toArray();
printjson(lessonsInIds);
print(`Matched: ${lessonsInIds.length}`);

printHeader('Steps whose name NOT IN a given list');
const stepNameList = [`${someLessons[0].name} Step 1`, `${someLessons[1].name} Step 1`];
const stepsNotIn = db.step.find(
  { name: { $nin: stepNameList } },
  { projection: { _id: 0, name: 1 } }
).limit(5).toArray();
printjson(stepsNotIn);
print(`Matched (sampled): ${stepsNotIn.length}`);

// $not with regex: modules whose name does NOT match /Basic/i
printHeader('Modules whose name does NOT match /Basic/i using $not');
const modsNotBasic = db.module.find(
  { name: { $not: /Basic/i } },
  { projection: { _id: 0, name: 1 } }
).toArray();
printjson(modsNotBasic);
print(`Matched: ${modsNotBasic.length}`);

print('\n[OK] Operator examples complete.');