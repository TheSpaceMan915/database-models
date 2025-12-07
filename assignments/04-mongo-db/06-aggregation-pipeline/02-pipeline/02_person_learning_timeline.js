// assignments/04-mongo-db/06-aggregation-pipeline/02-pipeline/02_person_learning_timeline.js

// How to run:
//   mongosh assignments/04-mongo-db/06-aggregation-pipeline/02-pipeline/02_person_learning_timeline.js
// Time-series per person: cumulative completed steps and a 3-day moving average using $setWindowFields.
// If range-by-day windows are unavailable in your environment, see the README for the documents-window fallback.

use('rsl_lp_db_pipeline');

function printHeader(title) {
  print(`\n=== ${title} ===`);
}
function byEmail(email) {
  const p = db.person.findOne({ email }, { projection: { _id: 1, email: 1, name: 1 } });
  if (!p) {
    print(`[WARN] Person not found for email: ${email}`);
  }
  return p;
}

// Sample: run for all persons. You can override by setting emails array.
const emails = ['alice@example.com', 'bob@example.com', 'carol@example.com'];

for (const email of emails) {
  const person = byEmail(email);
  if (!person) continue;

  printHeader(`Learning Timeline for ${person.name} <${person.email}>`);

  const completedId = db.status.findOne({ name: 'completed' })._id;

  const pipeline = [
    // Only completed steps for the person
    { $match: { person_id: person._id, status_id: completedId } },

    // Truncate updated_at to date (UTC) for daily buckets
    {
      $set: {
        date: {
          $dateTrunc: { date: '$updated_at', unit: 'day' }
        }
      }
    },

    // Group to daily counts
    {
      $group: {
        _id: { person_id: '$person_id', date: '$date' },
        daily_completed: { $sum: 1 }
      }
    },

    // Flatten fields
    {
      $project: {
        _id: 0,
        person_id: '$_id.person_id',
        date: '$_id.date',
        daily_completed: 1
      }
    },

    // Sort by date ascending
    { $sort: { date: 1 } },

    // Window functions: cumulative sum and 3-day moving average
    {
      $setWindowFields: {
        partitionBy: '$person_id',
        sortBy: { date: 1 },
        output: {
          cumulative_completed: {
            $sum: '$daily_completed',
            window: { documents: ['unbounded', 'current'] }
          },
          // Moving average over the last 3 days including current.
          // If range-by-day is supported, prefer:
          // { window: { range: [ -2, 0 ], unit: 'day' } }
          // For broad compatibility, we use documents window with pad/gaps tolerated.
          ma3_completed: {
            $avg: '$daily_completed',
            window: { documents: [-2, 0] }
          }
        }
      }
    },

    // Final projection
    {
      $project: {
        date: 1,
        daily_completed: 1,
        cumulative_completed: 1,
        ma3_completed: { $round: ['$ma3_completed', 3] }
      }
    }
  ];

  const timeline = db.person_step_progress.aggregate(pipeline).toArray();
  printjson(timeline);
}

print('\n[TIP] Daily buckets use $dateTrunc(unit:"day"). MA3 uses a trailing 3-document window.');
print('[OK] Person learning timeline pipeline complete.');