// assignments/04-mongo-db/04-array-operators/02-queries/03_remove_array_elements.js

// How to run:
//   mongosh assignments/04-mongo-db/04-array-operators/02-queries/03_remove_array_elements.js
// Demonstrates removals by value ($pull/$pullAll) and by position ($pop; arbitrary index via $unset+$pull null).

use('rsl_lp_db_array_ops');

function header(t) { print(`\n=== ${t} ===`); }
function showModule(name) {
  const doc = db.module.findOne({ name }, { projection: { _id: 0, name: 1, tags: 1 } });
  printjson(doc);
}
function showLesson(name) {
  const doc = db.lesson.findOne({ name }, { projection: { _id: 0, name: 1, resources: 1 } });
  printjson(doc);
}

// Targets
const modName = 'Alphabet';
const lessonName = 'Vowels';

// Remove by value: $pull a single tag from module.tags
header('1) Remove by value: $pull "beginner" from module.tags');
print('Before:');
showModule(modName);
const pullTagRes = db.module.updateOne({ name: modName }, { $pull: { tags: 'beginner' } });
print(`Matched: ${pullTagRes.matchedCount}, Modified: ${pullTagRes.modifiedCount}`);
print('After:');
showModule(modName);

// Remove by value: $pull resource by url from lesson.resources
header('2) Remove by value: $pull resource with url=... from lesson.resources');
print('Before:');
showLesson(lessonName);
const pullResourceRes = db.lesson.updateOne(
  { name: lessonName },
  { $pull: { resources: { url: 'https://example.com/vowels/note' } } } // seeded "note" URL
);
print(`Matched: ${pullResourceRes.matchedCount}, Modified: ${pullResourceRes.modifiedCount}`);
print('After:');
showLesson(lessonName);

// $pullAll multiple tag values
header('3) Remove multiple tag values via $pullAll');
print('Before:');
showModule(modName);
const pullAllRes = db.module.updateOne(
  { name: modName },
  { $pullAll: { tags: ['video', 'popular'] } }
);
print(`Matched: ${pullAllRes.matchedCount}, Modified: ${pullAllRes.modifiedCount}`);
print('After:');
showModule(modName);

// Remove by position: $pop last and first
header('4) Remove by position: $pop last then $pop first on module.tags');
print('Before:');
showModule(modName);
const popLastRes = db.module.updateOne({ name: modName }, { $pop: { tags: 1 } });
print(`$pop last — Matched: ${popLastRes.matchedCount}, Modified: ${popLastRes.modifiedCount}`);
const popFirstRes = db.module.updateOne({ name: modName }, { $pop: { tags: -1 } });
print(`$pop first — Matched: ${popFirstRes.matchedCount}, Modified: ${popFirstRes.modifiedCount}`);
print('After:');
showModule(modName);

// Arbitrary index removal in object array: $unset then $pull null
// Rationale: MongoDB lacks direct "remove at index"; $unset sets the element to null, leaving a hole.
// Then $pull: { resources: null } compacts the array.
header('5) Remove resource at index 2 via $unset + $pull null');
print('Before:');
showLesson(lessonName);
const unsetRes = db.lesson.updateOne({ name: lessonName }, { $unset: { 'resources.2': 1 } });
print(`$unset resources.2 — Matched: ${unsetRes.matchedCount}, Modified: ${unsetRes.modifiedCount}`);
const pullNullRes = db.lesson.updateOne({ name: lessonName }, { $pull: { resources: null } });
print(`$pull null — Matched: ${pullNullRes.matchedCount}, Modified: ${pullNullRes.modifiedCount}`);
print('After:');
showLesson(lessonName);

print('\n[OK] Array removals complete.');