// assignments/04-mongo-db/04-array-operators/02-queries/01_insert_array_values.js

// How to run:
//   mongosh assignments/04-mongo-db/04-array-operators/02-queries/01_insert_array_values.js
// Demonstrates array inserts: $push, $addToSet, $each, $position, and inserting object resources.

use('rsl_lp_db_array_ops');

function header(t) { print(`\n=== ${t} ===`); }
function showModule(name) {
  const doc = db.module.findOne({ name }, { projection: { _id: 0, name: 1, tags: 1 } });
  printjson(doc);
}
function showLesson(name) {
  const doc = db.lesson.findOne(
    { name },
    { projection: { _id: 0, name: 1, resources: { $slice: 5 } } }
  );
  printjson(doc);
}

// Pick deterministic targets
const modName = 'Alphabet';
const lessonName = 'Vowels';

// 1) $push one tag into module.tags
header('1) $push one tag into module.tags');
print('Before:');
showModule(modName);
const pushResult = db.module.updateOne({ name: modName }, { $push: { tags: 'featured' } });
print(`Matched: ${pushResult.matchedCount}, Modified: ${pushResult.modifiedCount}`);
print('After:');
showModule(modName);

// 2) $addToSet to avoid duplicates; also $addToSet with $each
header('2) $addToSet dedupe and $each to add multiple unique tags');
print('Before:');
showModule(modName);
const addToSetResult = db.module.updateOne(
  { name: modName },
  { $addToSet: { tags: { $each: ['beginner', 'popular', 'video'] } } }
);
print(`Matched: ${addToSetResult.matchedCount}, Modified: ${addToSetResult.modifiedCount}`);
print('After:');
showModule(modName);

// 3) $push with $each and $position to insert tags at a specific index
header('3) $push $each at position 1');
print('Before:');
showModule(modName);
const pushEachPositionResult = db.module.updateOne(
  { name: modName },
  { $push: { tags: { $each: ['inserted1', 'inserted2'], $position: 1 } } }
);
print(`Matched: ${pushEachPositionResult.matchedCount}, Modified: ${pushEachPositionResult.modifiedCount}`);
print('After:');
showModule(modName);

// 4) $push a resource object into lesson.resources
header('4) $push a resource object into lesson.resources');
print('Before (first 5):');
showLesson(lessonName);
const newResource = {
  kind: 'note',
  url: 'https://example.com/vowels/extra-note',
  title: 'Vowels — Extra Notes'
};
const pushResourceResult = db.lesson.updateOne({ name: lessonName }, { $push: { resources: newResource } });
print(`Matched: ${pushResourceResult.matchedCount}, Modified: ${pushResourceResult.modifiedCount}`);
print('After (first 5):');
showLesson(lessonName);

print('\n[OK] Array inserts complete.');