// assignments/04-mongo-db/02-documents-and-indexes/02-queries/02_update_and_add_fields.js
use('rsl_lp_db_docs_idx');
const modBefore = db.module.findOne({ name: 'Basic Phrases' }, { projection: { name: 1 } });
print('Module before rename:'); printjson(modBefore);
const res1 = db.module.updateOne({ name: 'Basic Phrases' }, { $set: { name: 'Basic Phrases (Updated)' } });
print(`Rename module result: matched=${res1.matchedCount}, modified=${res1.modifiedCount}`);
const modAfter = db.module.findOne({ _id: modBefore?._id }, { projection: { name: 1 } });
print('Module after rename:'); printjson(modAfter);
const alphabet = db.module.findOne({ name: { $in: ['Alphabet', 'Alphabet (Updated)'] } }) || db.module.findOne({ name: 'Alphabet' });
if (alphabet) {
  const lesson = db.lesson.findOne({ module_id: alphabet._id }, { projection: { name: 1 } });
  if (lesson) {
    const res2 = db.lesson.updateOne({ _id: lesson._id }, { $set: { tags: ['video', 'beginner'] } });
    print(`Add lesson tags: matched=${res2.matchedCount}, modified=${res2.modifiedCount}`);
    const res3 = db.step.updateMany({ lesson_id: lesson._id, $or: [{ notes: { $exists: false } }, { notes: '' }] }, { $set: { notes: 'Auto-filled note' } });
    print(`Fill missing step.notes: matched=${res3.matchedCount}, modified=${res3.modifiedCount}`);
  }
}
const res4 = db.module.updateOne({ name: 'Supplemental (Demo)' }, { $set: { description: 'Created via upsert (idempotent)' } }, { upsert: true });
print(`Upsert module: matched=${res4.matchedCount}, upsertedId=${tojson(res4.upsertedId)}, modified=${res4.modifiedCount}`);
const sampleLesson = db.lesson.findOne({}, { projection: { name: 1, tags: 1 } });
print('Sample lesson after updates:'); printjson(sampleLesson);
