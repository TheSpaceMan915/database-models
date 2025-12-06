// assignments/04-mongo-db/05-regular-expressions/01-db-setup/02_seed.js

// How to run:
//   mongosh assignments/04-mongo-db/05-regular-expressions/01-db-setup/02_seed.js
// Inserts deterministic mock data with names crafted for regex demos. Also seeds progress docs.

use('rsl_lp_db_regex');

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

// Modules (4) with varied names for regex testing
const modulesData = [
  { name: 'Alphabet Basics', description: 'Letters and pronunciation.' },
  { name: 'Basic Phrases', description: 'Greetings and simple phrases.' },
  { name: 'Advanced Dialogues', description: 'Complex conversational dialogues.' },
  { name: 'Conversational Skills', description: 'Practical conversation.* patterns.' }
];
for (const m of modulesData) {
  db.module.updateOne({ name: m.name }, { $setOnInsert: m }, { upsert: true });
}
const modules = db.module.find({}).toArray();
const moduleByName = Object.fromEntries(modules.map(m => [m.name, m]));

// Lessons per module (2–3 each) with names including numbers/prefixes
const lessonsPlan = [
  { module: 'Alphabet Basics', lessons: ['Lesson 01: Letters', 'Lesson 1A: Vowels', 'Lesson 12: Consonants'] },
  { module: 'Basic Phrases', lessons: ['Lesson 02: Greetings', 'Lesson 1B: Introductions'] },
  { module: 'Advanced Dialogues', lessons: ['Lesson 03: At the Cafe', 'Lesson 10: Asking Directions'] },
  { module: 'Conversational Skills', lessons: ['Lesson 1C: Small Talk', 'Lesson 11: Negotiation'] }
];
for (const plan of lessonsPlan) {
  const mod = moduleByName[plan.module];
  for (const name of plan.lessons) {
    db.lesson.updateOne(
      { module_id: mod._id, name },
      { $setOnInsert: { module_id: mod._id, name, description: `${name} overview.` } },
      { upsert: true }
    );
  }
}
const lessons = db.lesson.find({}).toArray();
const lessonByName = Object.fromEntries(lessons.map(l => [l.name, l]));

// Steps per lesson (2–4 each) with diverse name patterns
function makeStepsForLesson(lessonName, count) {
  const steps = [];
  for (let i = 1; i <= count; i++) {
    const variant = i % 3 === 0 ? `Note: Extra ${i}` : (i === 2 ? `Step 2 – Focus` : `Step ${i}: Intro`);
    steps.push({
      name: variant,
      url: `https://example.com/${lessonName.toLowerCase().replace(/\s+/g, '-')}/step-${i}`,
      notes: `Helper note for ${lessonName} — ${variant}.`
    });
  }
  return steps;
}

for (const lesson of lessons) {
  const count = (lesson.name.length % 3) + 2; // deterministic 2–4 steps
  const steps = makeStepsForLesson(lesson.name, count);
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    db.step.updateOne(
      { lesson_id: lesson._id, name: s.name },
      {
        $setOnInsert: {
          lesson_id: lesson._id,
          name: s.name,
          url: s.url,
          notes: s.notes
        }
      },
      { upsert: true }
    );
  }
}
const steps = db.step.find({}).toArray();

// Progress samples across statuses
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
  if (!stepDoc) return;
  db.person_step_progress.updateOne(
    { person_id: person._id, step_id: stepDoc._id },
    { $set: { status_id: status._id, updated_at: new Date() } },
    { upsert: true }
  );
}

// Module progress samples
upsertModuleProgress('alice@example.com', 'Alphabet Basics', 'completed');
upsertModuleProgress('alice@example.com', 'Basic Phrases', 'in_progress');
upsertModuleProgress('bob@example.com', 'Advanced Dialogues', 'available');
upsertModuleProgress('carol@example.com', 'Conversational Skills', 'in_progress');

// Lesson progress samples
upsertLessonProgress('alice@example.com', 'Lesson 01: Letters', 'completed');
upsertLessonProgress('bob@example.com', 'Lesson 02: Greetings', 'completed');
upsertLessonProgress('carol@example.com', 'Lesson 1C: Small Talk', 'available');

// Step progress samples
upsertStepProgress('alice@example.com', 'Lesson 01: Letters', 'Step 1: Intro', 'completed');
upsertStepProgress('bob@example.com', 'Lesson 02: Greetings', 'Step 2 – Focus', 'completed');
upsertStepProgress('carol@example.com', 'Lesson 1C: Small Talk', 'Note: Extra 3', 'in_progress');

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