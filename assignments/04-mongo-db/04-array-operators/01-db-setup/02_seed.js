// assignments/04-mongo-db/04-array-operators/01-db-setup/02_seed.js

// How to run:
//   mongosh assignments/04-mongo-db/04-array-operators/01-db-setup/02_seed.js
// Inserts deterministic mock data including arrays: module.tags, lesson.resources, step.tags.
// Also seeds progress docs covering all status values.

use('rsl_lp_db_array_ops');

const now = new Date();

// Ensure statuses present
const statusNames = ['available', 'in_progress', 'completed'];
const existingStatuses = db.status.find({ name: { $in: statusNames } }).toArray();
const existingSet = new Set(existingStatuses.map(s => s.name));
const toInsertStatus = statusNames.filter(n => !existingSet.has(n)).map(n => ({ name: n }));
if (toInsertStatus.length) {
  db.status.insertMany(toInsertStatus);
  print(`[SEED] Inserted statuses: ${toInsertStatus.map(s => s.name).join(', ')}`);
}
const statuses = db.status.find({}).toArray();
const statusByName = Object.fromEntries(statuses.map(s => [s.name, s]));

// Persons (>=3)
const personsData = [
  { email: 'alice@example.com', password_hash: 'demo_hash_alice', created_at: now, name: 'Alice' },
  { email: 'bob@example.com', password_hash: 'demo_hash_bob', created_at: now, name: 'Bob' },
  { email: 'carol@example.com', password_hash: 'demo_hash_carol', created_at: now, name: 'Carol' }
];
for (const p of personsData) {
  db.person.updateOne({ email: p.email }, { $setOnInsert: p }, { upsert: true });
}
const persons = db.person.find({}).toArray();
const personByEmail = Object.fromEntries(persons.map(p => [p.email, p]));

// Modules with initial tags
const modulesData = [
  { name: 'Alphabet', description: 'Letters and pronunciation.', tags: ['beginner', 'video'] },
  { name: 'Basic Phrases', description: 'Greetings and simple phrases.', tags: ['beginner', 'note'] },
  { name: 'Dialogues', description: 'Common conversational dialogues.', tags: ['intermediate', 'quiz'] },
  { name: 'Numbers', description: 'Counting and numeric forms.', tags: ['beginner'] }
];
for (const m of modulesData) {
  db.module.updateOne({ name: m.name }, { $setOnInsert: m }, { upsert: true });
}
const modules = db.module.find({}).toArray();
const moduleByName = Object.fromEntries(modules.map(m => [m.name, m]));

// Lessons per module (2–3 each) with resources array
const lessonsPlan = [
  { module: 'Alphabet', lessons: ['Vowels', 'Consonants'] },
  { module: 'Basic Phrases', lessons: ['Greetings', 'Introductions', 'Thanks'] },
  { module: 'Dialogues', lessons: ['At the Cafe', 'Asking for Directions'] },
  { module: 'Numbers', lessons: ['Counting to Ten', 'Dozens and Hundreds'] }
];

function makeResourcesForLesson(lessonName) {
  // Deterministic set: video + note; some lessons also get a quiz based on name length parity
  const baseSlug = lessonName.toLowerCase().replace(/\s+/g, '-');
  const resources = [
    { kind: 'video', url: `https://example.com/${baseSlug}/video`, title: `${lessonName} — Video` },
    { kind: 'note', url: `https://example.com/${baseSlug}/note`, title: `${lessonName} — Notes` }
  ];
  if (lessonName.length % 2 === 0) {
    resources.push({ kind: 'quiz', url: `https://example.com/${baseSlug}/quiz`, title: `${lessonName} — Quiz` });
  }
  return resources;
}

for (const plan of lessonsPlan) {
  const mod = moduleByName[plan.module];
  for (const name of plan.lessons) {
    const resources = makeResourcesForLesson(name);
    db.lesson.updateOne(
      { module_id: mod._id, name },
      {
        $setOnInsert: {
          module_id: mod._id,
          name,
          description: `${name} lesson.`,
          resources
        }
      },
      { upsert: true }
    );
  }
}
const lessons = db.lesson.find({}).toArray();
const lessonByName = Object.fromEntries(lessons.map(l => [l.name, l]));

// Steps per lesson (2–4 each) with some tags
function makeStepsForLesson(lessonName, count) {
  const baseSlug = lessonName.toLowerCase().replace(/\s+/g, '-');
  const steps = [];
  for (let i = 1; i <= count; i++) {
    const tags = i % 2 === 0 ? ['practice', 'even'] : ['practice', 'odd'];
    steps.push({
      name: `${lessonName} Step ${i}`,
      url: `https://example.com/${baseSlug}/step-${i}`,
      notes: `Practice item ${i} for ${lessonName}.`,
      tags
    });
  }
  return steps;
}

for (const lesson of lessons) {
  const count = (lesson.name.length % 3) + 2; // deterministic 2–4 steps
  const steps = makeStepsForLesson(lesson.name, count);
  for (const s of steps) {
    db.step.updateOne(
      { lesson_id: lesson._id, name: s.name },
      {
        $setOnInsert: {
          lesson_id: lesson._id,
          name: s.name,
          url: s.url,
          notes: s.notes,
          tags: s.tags
        }
      },
      { upsert: true }
    );
  }
}
const steps = db.step.find({}).toArray();

// Progress samples across all statuses
function upsertModuleProgress(personEmail, moduleName, statusName) {
  const person = personByEmail[personEmail];
  const mod = moduleByName[moduleName];
  const status = statusByName[statusName];
  db.person_module_progress.updateOne(
    { person_id: person._id, module_id: mod._id },
    { $set: { status_id: status._id, updated_at: new Date() } },
    { upsert: true }
  );
}
function upsertLessonProgress(personEmail, lessonName, statusName) {
  const person = personByEmail[personEmail];
  const lesson = lessonByName[lessonName];
  const status = statusByName[statusName];
  db.person_lesson_progress.updateOne(
    { person_id: person._id, lesson_id: lesson._id },
    { $set: { status_id: status._id, updated_at: new Date() } },
    { upsert: true }
  );
}
function upsertStepProgress(personEmail, lessonName, stepName, statusName) {
  const person = personByEmail[personEmail];
  const lesson = lessonByName[lessonName];
  const stepDoc = db.step.findOne({ lesson_id: lesson._id, name: stepName });
  const status = statusByName[statusName];
  db.person_step_progress.updateOne(
    { person_id: person._id, step_id: stepDoc._id },
    { $set: { status_id: status._id, updated_at: new Date() } },
    { upsert: true }
  );
}

// Samples
upsertModuleProgress('alice@example.com', 'Alphabet', 'completed');
upsertModuleProgress('alice@example.com', 'Basic Phrases', 'in_progress');
upsertModuleProgress('bob@example.com', 'Dialogues', 'available');
upsertModuleProgress('carol@example.com', 'Numbers', 'in_progress');

upsertLessonProgress('alice@example.com', 'Vowels', 'completed');
upsertLessonProgress('bob@example.com', 'Greetings', 'completed');
upsertLessonProgress('carol@example.com', 'Counting to Ten', 'available');

upsertStepProgress('alice@example.com', 'Vowels', 'Vowels Step 1', 'completed');
upsertStepProgress('bob@example.com', 'Greetings', 'Greetings Step 1', 'completed');
upsertStepProgress('carol@example.com', 'Counting to Ten', 'Counting to Ten Step 1', 'in_progress');

// Print counts
function countColl(name) {
  return db[name].countDocuments({});
}

print('[COUNTS]');
print(`person: ${countColl('person')}`);
print(`module: ${countColl('module')}`);
print(`lesson: ${countColl('lesson')}`);
print(`step: ${countColl('step')}`);
print(`status: ${countColl('status')}`);
print(`person_module_progress: ${countColl('person_module_progress')}`);
print(`person_lesson_progress: ${countColl('person_lesson_progress')}`);
print(`person_step_progress: ${countColl('person_step_progress')}`);

print('[OK] Seeding complete.');