// assignments/04-mongo-db/03-queries-and-expressions/02-queries/01_find_basics.js

// How to run:
//   mongosh assignments/04-mongo-db/03-queries-and-expressions/02-queries/01_find_basics.js
// Demonstrates basic find with equality, projections, $and/$or, field existence, and case-insensitive regex.

use('rsl_lp_db_queries_expr');

function printHeader(title) {
  print(`\n=== ${title} ===`);
}

// 1) Equality + projection: find a module by exact name and project fields
printHeader('Find module by exact name with projection');
const modExact = db.module.find(
  { name: 'Basic Phrases' },
  { projection: { _id: 0, name: 1, description: 1 } }
).toArray();
printjson(modExact);

// 2) $and/$or: lessons in a set of modules (Alphabet OR Dialogues)
printHeader('Lessons in modules Alphabet OR Dialogues using $or');
const targetMods = db.module.find({ name: { $in: ['Alphabet', 'Dialogues'] } }, { projection: { _id: 1 } }).toArray();
const targetModIds = targetMods.map(m => m._id);
const lessonsInSet = db.lesson.find(
  { $and: [{ module_id: { $in: targetModIds } }] },
  { projection: { _id: 0, name: 1 } }
).toArray();
printjson(lessonsInSet);

// 3) Field existence and non-empty notes for steps
printHeader('Steps where notes exists and is non-empty');
const stepsWithNotes = db.step.find(
  { notes: { $exists: true, $ne: '' } },
  { projection: { _id: 0, name: 1, notes: 1 } }
).limit(5).toArray();
printjson(stepsWithNotes);

// 4) Case-insensitive regex (caution: avoid unindexed regex on large fields)
// Example: modules with name matching /basic/i
printHeader('Case-insensitive regex on module name: /basic/i');
const regexMods = db.module.find(
  { name: { $regex: /basic/i } },
  { projection: { _id: 0, name: 1 } }
).toArray();
printjson(regexMods);

print('\n[OK] Basic find examples complete.');