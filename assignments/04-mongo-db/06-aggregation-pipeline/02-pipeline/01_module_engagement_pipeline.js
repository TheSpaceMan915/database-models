// assignments/04-mongo-db/06-aggregation-pipeline/02-pipeline/01_module_engagement_pipeline.js

// How to run:
//   mongosh assignments/04-mongo-db/06-aggregation-pipeline/02-pipeline/01_module_engagement_pipeline.js
// Dashboard-like pipeline: per-module metrics including lessons, steps, unique learners, completed steps,
// completion rate, and top modules by completion rate. Uses $lookup, $unwind, $group, $project, $facet.

use('rsl_lp_db_pipeline');

function printHeader(title) {
  print(`\n=== ${title} ===`);
}

// Build pipeline from person_step_progress as the activity source
const pipeline = [
  // Consider only in_progress or completed to reflect engagement
  {
    $match: {
      status_id: { $in: db.status.find({ name: { $in: ['in_progress', 'completed'] } }, { _id: 1 }).map(s => s._id) }
    }
  },
  // Join step to get lesson_id
  {
    $lookup: {
      from: 'step',
      localField: 'step_id',
      foreignField: '_id',
      as: 'step'
    }
  },
  { $unwind: { path: '$step', preserveNullAndEmptyArrays: false } },
  // Join lesson to get module_id
  {
    $lookup: {
      from: 'lesson',
      localField: 'step.lesson_id',
      foreignField: '_id',
      as: 'lesson'
    }
  },
  { $unwind: { path: '$lesson', preserveNullAndEmptyArrays: false } },
  // Join module to group by module
  {
    $lookup: {
      from: 'module',
      localField: 'lesson.module_id',
      foreignField: '_id',
      as: 'module'
    }
  },
  { $unwind: { path: '$module', preserveNullAndEmptyArrays: false } },

  // Compute per-module aggregates
  {
    $group: {
      _id: '$module._id',
      module_name: { $first: '$module.name' },
      unique_learners: { $addToSet: '$person_id' }, // unique people touching steps in the module
      // Track completed flags per step-person to count completions
      completed_events: {
        $sum: {
          $cond: [
            {
              $in: [
                '$status_id',
                db.status.find({ name: 'completed' }, { _id: 1 }).map(s => s._id)
              ]
            },
            1,
            0
          ]
        }
      }
    }
  },

  // Enrich with total lessons and steps per module via side lookups
  {
    $lookup: {
      from: 'lesson',
      localField: '_id',
      foreignField: 'module_id',
      as: 'module_lessons'
    }
  },
  {
    $lookup: {
      from: 'step',
      let: { lessonIds: '$module_lessons._id' },
      pipeline: [
        { $match: { $expr: { $in: ['$lesson_id', '$$lessonIds'] } } },
        { $project: { _id: 1 } }
      ],
      as: 'module_steps'
    }
  },

  // Compute derived metrics
  {
    $project: {
      module_name: 1,
      lessons_count: { $size: '$module_lessons' },
      steps_count: { $size: '$module_steps' },
      unique_learners_count: { $size: '$unique_learners' },
      completed_steps_count: '$completed_events',
      // completion_rate: completed / (steps_count * unique_learners_count)
      completion_rate: {
        $cond: [
          { $gt: [{ $multiply: [{ $size: '$module_steps' }, { $size: '$unique_learners' }] }, 0] },
          {
            $round: [
              {
                $divide: [
                  '$completed_events',
                  { $multiply: [{ $size: '$module_steps' }, { $size: '$unique_learners' }] }
                ]
              },
              4
            ]
          },
          0
        ]
      }
    }
  },

  // Facet: per-module summary sorted by completion_rate desc, and overall totals
  {
    $facet: {
      module_summary: [
        { $sort: { completion_rate: -1, module_name: 1 } },
        { $project: { _id: 0, module_name: 1, lessons_count: 1, steps_count: 1, unique_learners_count: 1, completed_steps_count: 1, completion_rate: 1 } }
      ],
      totals: [
        {
          $group: {
            _id: null,
            modules: { $sum: 1 },
            total_lessons: { $sum: '$lessons_count' },
            total_steps: { $sum: '$steps_count' },
            total_unique_learners: { $sum: '$unique_learners_count' },
            total_completed_events: { $sum: '$completed_steps_count' }
          }
        },
        { $project: { _id: 0 } }
      ]
    }
  }
];

printHeader('Module Engagement Pipeline — Results');
const result = db.person_step_progress.aggregate(pipeline).toArray();
printjson(result);

print('\n[TIP] completion_rate = completed_events / (total_steps * unique_learners) rounded to 4 decimals.');
print('[OK] Module engagement pipeline complete.');