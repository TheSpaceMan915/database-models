// assignments/04-mongo-db/03-queries-and-expressions/02-queries/02_sort_limit_skip_count.js

// How to run:
//   mongosh assignments/04-mongo-db/03-queries-and-expressions/02-queries/02_sort_limit_skip_count.js
// Demonstrates sort (asc/desc), limit, skip (pagination), and counting approaches.

use('rsl_lp_db_queries_expr');

function printHeader(title) {
  print(`\n=== ${title} ===`);
}

// Sort by name ascending
printHeader('Modules sorted by name ASC');
const modsAsc = db.module.find({}, { projection: { _id: 0, name: 1 } }).sort({ name: 1 }).toArray();
printjson(modsAsc);

// Sort by name descending
printHeader('Modules sorted by name DESC');
const modsDesc = db.module.find({}, { projection: { _id: 0, name: 1 } }).sort({ name: -1 }).toArray();
printjson(modsDesc);

// Limit top N (N=2)
printHeader('Top 2 modules by name ASC');
const top2Mods = db.module.find({}, { projection: { _id: 0, name: 1 } }).sort({ name: 1 }).limit(2).toArray();
printjson(top2Mods);

// Skip for page 2 with size N=2
printHeader('Pagination example: page 2, size 2 (sorted ASC)');
const pageSize = 2;
const page = 2;
const page2Mods = db.module.find({}, { projection: { _id: 0, name: 1 } })
  .sort({ name: 1 })
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .toArray();
printjson(page2Mods);

// Counting: accurate countDocuments vs. estimatedDocumentCount
printHeader('Counting modules');
const totalAccurate = db.module.countDocuments({});
const totalEstimated = db.module.estimatedDocumentCount();
print(`countDocuments: ${totalAccurate}`);
print(`estimatedDocumentCount: ${totalEstimated}`);
print('Note: legacy count() is deprecated; prefer countDocuments(filter).');

// Combined example: find lessons for a module, sort, paginate, count total
printHeader('Combined: Lessons for "Basic Phrases" sorted by name, page 1 of N');
const targetModule = db.module.findOne({ name: 'Basic Phrases' });
const lessonFilter = { module_id: targetModule._id };
const totalLessons = db.lesson.countDocuments(lessonFilter);
const perPage = 2;
const currentPage = 1;
const totalPages = Math.max(1, Math.ceil(totalLessons / perPage));
const pageLessons = db.lesson.find(lessonFilter, { projection: { _id: 0, name: 1 } })
  .sort({ name: 1 })
  .skip((currentPage - 1) * perPage)
  .limit(perPage)
  .toArray();

printjson(pageLessons);
print(`Page ${currentPage} of ${totalPages} | Total lessons: ${totalLessons}`);

print('\n[OK] Sort/Limit/Skip/Count examples complete.');