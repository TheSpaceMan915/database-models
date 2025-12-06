// assignments/04-mongo-db/04-array-operators/02-queries/02_update_array_by_index_and_value.js

// How to run:
//   mongosh assignments/04-mongo-db/04-array-operators/02-queries/02_update_array_by_index_and_value.js
// Demonstrates updates by position (direct index) and by value via arrayFilters for strings and objects.

use('rsl_lp_db_array_ops');

function header(t) { print(`\n=== ${t} ===`); }
function showModule(name) {
  const doc = db.module.findOne({ name }, { projection: { _id: 0, name: 1, tags: 1 } });
  printjson(doc);
}
function showLesson(name) {
  const doc = db.lesson.findOne(
    { name },
    { projection: { _id: 0, name: 1, resources: 1 } }
  );
  printjson(doc);
}
function showStep(lessonName, stepName) {
  const lesson = db.lesson.findOne({ name: lessonName }, { projection: { _id: 1 } });
  const doc = db.step.findOne(
    { lesson_id: lesson._id, name: stepName },
    { projection: { _id: 0, name: 1, tags: 1 } }
  );
  printjson(doc);
}

// Targets
const modName = 'Alphabet';
const lessonName = 'Vowels';
const stepName = 'Vowels Step 1';

// Update by position: module.tags.1 and lesson.resources.0.title
header('1) Update by position: module.tags[1] = "updated_tag"');
print('Before:');
showModule(modName);
const posUpdateRes1 = db.module.updateOne(
  { name: modName },
  { $set: { 'tags.1': 'updated_tag' } }
);
print(`Matched: ${posUpdateRes1.matchedCount}, Modified: ${posUpdateRes1.modifiedCount}`);
print('After:');
showModule(modName);

header('2) Update by position: lesson.resources[0].title = "Updated Title"');
print('Before:');
showLesson(lessonName);
const posUpdateRes2 = db.lesson.updateOne(
  { name: lessonName },
  { $set: { 'resources.0.title': 'Updated Title' } }
);
print(`Matched: ${posUpdateRes2.matchedCount}, Modified: ${posUpdateRes2.modifiedCount}`);
print('After:');
showLesson(lessonName);

// Update by value using arrayFilters
header('3) Update by value (string array): rename tag "odd" -> "renamed" on step.tags');
print('Before:');
showStep(lessonName, stepName);
const stepDoc = db.step.findOne({ name: stepName });
const valueUpdateRes1 = db.step.updateOne(
  { name: stepName },
  { $set: { 'tags.$[t]': 'renamed' } },
  { arrayFilters: [{ t: 'odd' }] }
);
print(`Matched: ${valueUpdateRes1.matchedCount}, Modified: ${valueUpdateRes1.modifiedCount}`);
print('After:');
showStep(lessonName, stepName);

// Object array value update: match resource by url and update title
header('4) Update by value (object array): set title for resource with specific URL');
print('Before:');
showLesson(lessonName);
const targetUrl = 'https://example.com/vowels/video'; // seeded URL
const valueUpdateRes2 = db.lesson.updateOne(
  { name: lessonName },
  { $set: { 'resources.$[r].title': 'New Title for Video' } },
  { arrayFilters: [{ 'r.url': targetUrl }] }
);
print(`Matched: ${valueUpdateRes2.matchedCount}, Modified: ${valueUpdateRes2.modifiedCount}`);
print('After:');
showLesson(lessonName);

print('\n[OK] Array updates complete.');