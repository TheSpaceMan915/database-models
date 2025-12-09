// Run after 01_collections_and_indexes.js:
//   mongosh --file assignments/04-mongo-db/10-array-operators-v2/01-db-setup/02_seed.js
//
// Purpose: Deterministic seeding (fixed arrays + Date arithmetic). Uses upserts by unique keys.
// Arrays are present on user, preferences (for multi-valued keys), and event tags.

db = db.getSiblingDB('user_pref_db_array_v2');

function upsertOne(coll, filter, doc) {
  return db.getCollection(coll).updateOne(filter, { $set: doc }, { upsert: true });
}
function nowMinusDays(d) { return new Date(Date.now() - d * 86400000); }

/* ------------------------------- Users ------------------------------- */
const users = [
  { email: 'alice@example.com',  display_name: 'Alice',
    favorite_cuisines: ['italian'], notification_channels: ['email','sms','whatsapp'] },
  { email: 'bob@example.com',    display_name: 'Bob',
    favorite_cuisines: ['mexican','japanese'], notification_channels: ['email'] },
  { email: 'carol@example.com',  display_name: 'Carol',
    favorite_cuisines: ['indian','georgian'], notification_channels: ['push','telegram'] },
  { email: 'dave@example.com',   display_name: 'Dave',
    favorite_cuisines: ['japanese'], notification_channels: ['email','push'] },
  { email: 'erin@example.com',   display_name: 'Erin',
    favorite_cuisines: ['italian','indian'], notification_channels: ['sms','telegram'] },
  { email: 'frank@example.com',  display_name: 'Frank',
    favorite_cuisines: ['mexican'], notification_channels: ['email','whatsapp'] },
  { email: 'grace@example.com',  display_name: 'Grace',
    favorite_cuisines: ['georgian','italian'], notification_channels: ['push','email','sms'] },
  { email: 'heidi@example.com',  display_name: 'Heidi',
    favorite_cuisines: ['italian','japanese','mexican'], notification_channels: ['whatsapp','push'] },
];

users.forEach(u => {
  upsertOne('user', { email: u.email }, { ...u, created_at: new Date() });
});
const userMap = {};
db.user.find({}, { email: 1 }).forEach(u => (userMap[u.email] = u._id));

/* ----------------------- Dimensions & Options ------------------------ */
const dims = [
  { dimension_key: 'theme',            name: 'Theme',            description: 'UI theme preference' },
  { dimension_key: 'cuisine_favorite', name: 'Favorite Cuisine', description: 'Preferred cuisines' },
  { dimension_key: 'spice_level',      name: 'Spice Level',      description: 'Preferred spice intensity' },
  { dimension_key: 'notifications',    name: 'Notifications',    description: 'Notification level' },
];
dims.forEach(d =>
  upsertOne('preference_dimension', { dimension_key: d.dimension_key }, { ...d, created_at: new Date() })
);

const dimMap = {};
db.preference_dimension.find({}, { dimension_key: 1 }).forEach(d => (dimMap[d.dimension_key] = d._id));

const optionsByDim = {
  theme: [
    { option_key: 'dark', label: 'Dark' },
    { option_key: 'light', label: 'Light' },
    { option_key: 'system', label: 'System' },
  ],
  cuisine_favorite: [
    { option_key: 'italian', label: 'Italian' },
    { option_key: 'japanese', label: 'Japanese' },
    { option_key: 'mexican', label: 'Mexican' },
    { option_key: 'georgian', label: 'Georgian' },
    { option_key: 'indian', label: 'Indian' },
  ],
  spice_level: [
    { option_key: 'mild', label: 'Mild' },
    { option_key: 'medium', label: 'Medium' },
    { option_key: 'hot', label: 'Hot' },
  ],
  notifications: [
    { option_key: 'all', label: 'All' },
    { option_key: 'important_only', label: 'Important Only' },
    { option_key: 'none', label: 'None' },
  ],
};
Object.entries(optionsByDim).forEach(([dimKey, options]) => {
  options.forEach(opt => {
    upsertOne(
      'preference_option',
      { dimension_id: dimMap[dimKey], option_key: opt.option_key },
      { ...opt, dimension_id: dimMap[dimKey], created_at: new Date() }
    );
  });
});

/* ----------------------------- Preferences --------------------------- */
const prefDefs = [
  // email, pref_key, value, source, confidence, daysAgo
  ['alice@example.com', 'theme', 'dark', 'manual', 0.95, 2],
  ['alice@example.com', 'notifications', 'important_only', 'default', 0.8, 3],
  ['alice@example.com', 'spice_level', 'medium', 'inferred', 0.7, 5],
  ['alice@example.com', 'cuisine_favorite', ['italian'], 'manual', 0.9, 1],

  ['bob@example.com', 'theme', 'light', 'default', 0.9, 7],
  ['bob@example.com', 'notifications', 'all', 'manual', 0.95, 2],
  ['bob@example.com', 'cuisine_favorite', ['mexican'], 'inferred', 0.6, 4],

  ['carol@example.com', 'theme', 'system', 'manual', 0.95, 1],
  ['carol@example.com', 'spice_level', 'hot', 'inferred', 0.65, 6],
  ['carol@example.com', 'cuisine_favorite', ['indian','georgian'], 'manual', 0.95, 2],

  ['dave@example.com', 'theme', 'dark', 'default', 0.85, 10],
  ['dave@example.com', 'notifications', 'none', 'manual', 0.95, 3],
  ['dave@example.com', 'cuisine_favorite', ['japanese'], 'inferred', 0.7, 8],

  ['erin@example.com', 'theme', 'light', 'manual', 0.95, 1],
  ['erin@example.com', 'spice_level', 'mild', 'default', 0.85, 9],
  ['erin@example.com', 'cuisine_favorite', ['italian'], 'manual', 0.95, 5],

  ['frank@example.com', 'notifications', 'all', 'default', 0.8, 6],
  ['frank@example.com', 'spice_level', 'medium', 'inferred', 0.6, 4],
  ['frank@example.com', 'cuisine_favorite', ['mexican','indian'], 'manual', 0.9, 2],

  ['grace@example.com', 'theme', 'dark', 'manual', 0.95, 2],
  ['grace@example.com', 'notifications', 'important_only', 'manual', 0.95, 1],
  ['grace@example.com', 'cuisine_favorite', ['georgian'], 'inferred', 0.7, 5],

  ['heidi@example.com', 'theme', 'system', 'default', 0.85, 12],
  ['heidi@example.com', 'spice_level', 'mild', 'inferred', 0.55, 9],
  ['heidi@example.com', 'cuisine_favorite', ['italian','japanese','mexican'], 'manual', 0.9, 3],
];
prefDefs.forEach(([email, key, value, source, conf, days]) => {
  const filter = { user_id: userMap[email], pref_key: key };
  const doc = {
    user_id: userMap[email],
    pref_key: key,
    value: value,
    source: source,
    confidence: conf,
    updated_at: nowMinusDays(days),
  };
  upsertOne('user_preferences', filter, doc);
});

/* ----------------------------- Event history ------------------------ */
function insertEvent(email, key, oldVal, newVal, source, conf, daysAgo, eventType, tags) {
  db.user_preference_events.insertOne({
    user_id: userMap[email],
    pref_key: key,
    old_value: oldVal,
    new_value: newVal,
    source: source,
    confidence: conf,
    performed_at: nowMinusDays(daysAgo),
    event_type: eventType || 'set',
    tags: tags || [],
  });
}

[
  // Alice (include tags: migration, auto, user_action)
  () => insertEvent('alice@example.com', 'theme', 'light', 'dark', 'manual', 0.95, 9, 'set', ['user_action']),
  () => insertEvent('alice@example.com', 'cuisine_favorite', ['italian'], ['italian','japanese'], 'manual', 0.9, 6, 'set', ['auto']),
  () => insertEvent('alice@example.com', 'notifications', 'all', 'important_only', 'default', 0.8, 3, 'set', ['migration']),

  // Bob
  () => insertEvent('bob@example.com', 'theme', 'system', 'light', 'default', 0.9, 11, 'set', ['auto']),
  () => insertEvent('bob@example.com', 'cuisine_favorite', [], ['mexican'], 'inferred', 0.6, 5, 'set', ['user_action']),
  () => insertEvent('bob@example.com', 'notifications', 'important_only', 'all', 'manual', 0.95, 2, 'set', ['migration']),

  // Carol
  () => insertEvent('carol@example.com', 'spice_level', 'medium', 'hot', 'inferred', 0.65, 8, 'set', ['auto']),
  () => insertEvent('carol@example.com', 'theme', 'dark', 'system', 'manual', 0.95, 4, 'set', ['user_action']),

  // Dave
  () => insertEvent('dave@example.com', 'notifications', 'all', 'none', 'manual', 0.95, 7, 'set', ['user_action']),
  () => insertEvent('dave@example.com', 'theme', 'light', 'dark', 'default', 0.85, 10, 'set', ['migration']),

  // Erin
  () => insertEvent('erin@example.com', 'theme', 'system', 'light', 'manual', 0.95, 6, 'set', ['auto']),
  () => insertEvent('erin@example.com', 'cuisine_favorite', [], ['italian'], 'manual', 0.95, 5, 'set', ['user_action']),

  // Frank
  () => insertEvent('frank@example.com', 'spice_level', 'mild', 'medium', 'inferred', 0.6, 9, 'set', ['auto']),
  () => insertEvent('frank@example.com', 'cuisine_favorite', ['mexican'], ['mexican','indian'], 'manual', 0.9, 2, 'set', ['migration']),

  // Grace
  () => insertEvent('grace@example.com', 'theme', 'light', 'dark', 'manual', 0.95, 3, 'set', ['user_action']),
  () => insertEvent('grace@example.com', 'notifications', 'all', 'important_only', 'manual', 0.95, 1, 'set', ['auto']),

  // Heidi
  () => insertEvent('heidi@example.com', 'spice_level', 'medium', 'mild', 'inferred', 0.55, 12, 'set', ['migration']),
  () => insertEvent('heidi@example.com', 'cuisine_favorite', ['italian'], ['italian','japanese','mexican'], 'manual', 0.9, 7, 'set', ['user_action']),
].forEach(fn => fn());

/* ------------------------------ Summary ---------------------------- */
function count(coll) { return db.getCollection(coll).countDocuments(); }
print('[seed] Counts:');
printjson({
  user: count('user'),
  preference_dimension: count('preference_dimension'),
  preference_option: count('preference_option'),
  user_preferences: count('user_preferences'),
  user_preference_events: count('user_preference_events'),
});
print('[ok] Seeding complete.');
