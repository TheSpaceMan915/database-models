// Compare COLLSCAN vs IXSCAN using explain('executionStats') and print compact summaries.
// Usage:
//   mongosh --file assignments/04-mongo-db/08-documents-and-indexes-v2/02-queries/03_scan_vs_index.js

db = db.getSiblingDB('user_pref_db_v2');

function planStage(node) {
  if (!node) return 'UNKNOWN';
  if (node.stage) {
    // Return the deepest interesting stage (e.g., IXSCAN under FETCH/SORT)
    if (node.inputStage) return planStage(node.inputStage);
    if (node.inputStages && node.inputStages.length) return planStage(node.inputStages[0]);
    return node.stage;
  }
  return 'UNKNOWN';
}

function summarizeExplain(expl) {
  const qp = expl.queryPlanner || {};
  const winning = qp.winningPlan || {};
  const stage = planStage(winning);
  const es = expl.executionStats || {};
  return {
    stage,
    nReturned: es.nReturned,
    totalDocsExamined: es.totalDocsExamined,
    totalKeysExamined: es.totalKeysExamined,
  };
}

// Example A: likely COLLSCAN (no filter)
const explUsers = db.user.find({}).explain('executionStats');
print('[A] db.user.find({}) — likely COLLSCAN');
printjson(summarizeExplain(explUsers));

// Prepare a user id for indexed lookups
const u = db.user.findOne({ email: 'alice@example.com' }, { _id: 1 });

// Example B: indexed lookup on user_preferences by (user_id, pref_key)
const explPrefs = db.user_preferences
  .find({ user_id: u._id, pref_key: 'theme' })
  .explain('executionStats');
print('[B] user_preferences by (user_id, pref_key) — expect IXSCAN');
printjson(summarizeExplain(explPrefs));

// Example C: explicit hint on user(email) to force index usage (be careful with hints)
const explHint = db.user
  .find({ email: 'alice@example.com' })
  .hint({ email: 1 })
  .explain('executionStats');
print('[C] user by email with hint({ email: 1 })');
printjson(summarizeExplain(explHint));

print('Notes: COLLSCAN = collection scan; IXSCAN = index scan. Prefer selective predicates on indexed fields.');
