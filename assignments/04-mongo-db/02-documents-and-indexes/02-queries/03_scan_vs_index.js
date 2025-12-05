// assignments/04-mongo-db/02-documents-and-indexes/02-queries/03_scan_vs_index.js
use('rsl_lp_db_docs_idx');
function deepestStage(plan) { let node = plan; while (node && (node.inputStage || (node.inputStages && node.inputStages.length))) { node = node.inputStage || node.inputStages?.[0]; } return node?.stage || plan?.stage || 'UNKNOWN'; }
print('--- Example 1: module.find({}) → expect COLLSCAN (no selective predicate) ---');
const exp1 = db.module.find({}).explain('executionStats'); const stage1 = deepestStage(exp1.queryPlanner.winningPlan);
print(`Winning plan stage: ${stage1}`); printjson({ totalDocsExamined: exp1.executionStats.totalDocsExamined });
print('--- Example 2: lesson.find({ module_id: <id> }) → expect IXSCAN on ix_lesson_module_id ---');
const m = db.module.findOne({}, { projection: { _id: 1, name: 1 } });
const exp2 = db.lesson.find({ module_id: m._id }).explain('executionStats'); const stage2 = deepestStage(exp2.queryPlanner.winningPlan);
print(`Module: ${m.name} (${m._id})`); print(`Winning plan stage: ${stage2}`); printjson({ totalDocsExamined: exp2.executionStats.totalDocsExamined, totalKeysExamined: exp2.executionStats.totalKeysExamined });
print('--- Example 3: Forcing index with hint() (use with caution) ---');
const exp3 = db.lesson.find({ module_id: m._id }).hint('ix_lesson_module_id').explain('executionStats'); const stage3 = deepestStage(exp3.queryPlanner.winningPlan);
print(`Winning plan stage (with hint): ${stage3}`); printjson({ totalDocsExamined: exp3.executionStats.totalDocsExamined, totalKeysExamined: exp3.executionStats.totalKeysExamined });
