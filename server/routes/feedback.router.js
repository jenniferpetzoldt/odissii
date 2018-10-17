const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

/**
 * GET routes
 */

// get the details for one entry of feedback
router.get('/detail/:feedbackId', (req, res) => {
  if (req.isAuthenticated()) {
    (async () => {
      try {
        const feedbackId = req.params.feedbackId;

        // if the user is a manager, check if one of their supervisors wrote the feedback,
        // otherwise don't send it
        if (req.user.role === 'manager') {
          const managerId = req.user.id;

          const supervisorsResponse = await pool.query(`
            SELECT * FROM "supervisor_manager" WHERE "manager_id" = $1;
          `, [managerId]);

          const supervisorIds = supervisorsResponse.rows.map(row => row.supervisor_id);

          const feedbackResponse = await pool.query(`
            SELECT 
              "feedback"."id",
              "feedback"."supervisor_id",
              "feedback"."employee_id",
              "feedback"."date_created",
              "feedback"."quality_id",
              "feedback"."task_related",
              "feedback"."culture_related",
              "feedback"."details",
              "feedback"."date_edited",
              "employee"."employeeId",
              "employee"."first_name",
              "employee"."last_name",
              "employee"."image_path" AS "employee_image_path"
            FROM "feedback" 
            JOIN "employee" ON "employee"."id" = "feedback"."employee_id" 
            WHERE "feedback"."id" = $1;
          `, [feedbackId]);

          const feedback = feedbackResponse.rows[0];

          if (supervisorIds.includes(feedback.supervisor_id)) {
            res.send(feedback);
          } else {
            throw new Error(`Manager with id ${managerId} is not authorized to view feedback by supervisor with id ${feedback.supervisor_id}.`);
          }
          // if the user is a supervisor, 
        } else if (req.user.role === 'supervisor') {
          const supervisorId = req.user.id;

          const feedbackResponse = await pool.query(`
            SELECT 
              "feedback"."id",
              "feedback"."supervisor_id",
              "feedback"."employee_id",
              "feedback"."date_created",
              "feedback"."quality_id",
              "feedback"."task_related",
              "feedback"."culture_related",
              "feedback"."details",
              "feedback"."date_edited",
              "employee"."employeeId",
              "employee"."first_name",
              "employee"."last_name",
              "employee"."image_path" AS "employee_image_path"
            FROM "feedback"
            JOIN "employee" on "employee"."id" = "feedback"."employee_id"
            WHERE "feedback"."id" = $1 AND "feedback"."supervisor_id" = $2;
          `, [feedbackId, supervisorId]);

          const feedback = feedbackResponse.rows[0];

          res.send(feedback);

          // if the user isn't a supervisor or manager, something is weird,
          // so tell them that they are forbidden
        } else {
          res.sendStatus(401);
        }
      } catch (error) {
        console.log(`/api/feedback/detail/${feedbackId} GET error:`, error);
        throw error;
      }
    })().catch(error => {
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(401);
  }
});

// gets all feedback for a specific supervisor, referenced by req.user.id
// will need to do a full join with the feedback_images table to get all associated feedback images
// and a join to get all follow-up records for all employees if no feedback has been given after the follow-up date
// should set a limit of responses
router.get('/', (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'supervisor') {
    const supervisorId = req.user.id;
    const queryText = `
            SELECT * FROM "feedback" 
            WHERE "supervisor_id" = $1 
            AND "date_created" >= (CURRENT_DATE - INTERVAL '12 months');
        `;
    pool.query(queryText, [supervisorId])
      .then(response => {
        console.log(`/api/feedback GET success`);
        res.send(response.rows);
      }).catch(error => {
        console.log(`/api/feedback GET error:`, error);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(401);
  }
});

// gets all feedback entries by a specific supervisor for the past 12 months
router.get('/supervisor/:id', (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'manager') {
    const supervisorId = req.params.id;
    const queryText = `SELECT * FROM "feedback" WHERE "supervisor_id" = $1 AND "date_created" >= (CURRENT_DATE - INTERVAL '12 months');`;
    pool.query(queryText, [supervisorId])
      .then(response => {
        console.log(`/api/feedback/supervisor/${supervisorId} GET success`);
        res.send(response.rows);
      }).catch(error => {
        console.log(`/api/feedback/supervisor/${supervisorId} GET error:`, error);
        res.sendStatus(500);
      })
  } else {
    res.sendStatus(401);
  }
});

// gets all feedback created by all supervisors associated with a specific manager, who is referenced by req.user.id
// will need to do a full join with the feedback_images table to get all associated feedback images
// and a join to get all follow-up records for all employees if no feedback has been given after the follow-up date
// should set a limit of responses
router.get('/supervisors/all', (req, res) => {
  if (req.isAuthenticated()) {
    const query = `SELECT DISTINCT "feedback"."supervisor_id", "first_name", "last_name",
                        (SELECT COUNT ("feedback"."quality_id")
                            FROM "feedback"
                            WHERE "feedback"."quality_id" = 2) as instruct,
                        (SELECT COUNT ("feedback"."quality_id") 
                            FROM "feedback" 
                            WHERE "feedback"."quality_id" = 3) as correct,
                        (SELECT COUNT ("feedback"."quality_id")
                            FROM "feedback" 
                            WHERE "feedback"."quality_id" = 1) as praise
                        FROM "feedback" 
                        FULL OUTER JOIN "quality_types" 
                        ON "quality_types"."id" = "feedback"."quality_id"
                        JOIN "supervisor_manager" 
                        ON "supervisor_manager"."supervisor_id" = "feedback"."supervisor_id"
                        JOIN "person"
                        ON "person"."id" = "feedback"."supervisor_id"
                        WHERE "supervisor_manager"."manager_id" = $1
                        GROUP BY "feedback"."quality_id", "quality_types"."id", "feedback"."supervisor_id", "first_name", "last_name";`;
    pool.query(query, [req.user.id]).then((results) => {
      res.send(results.rows);
    }).catch((error) => {
      console.log('Error getting supervisor feedback', error);
      res.sendStatus(500);
    })
  } else {
    res.sendStatus(403);
  }
});
// counts all praise, instruct, and correct feedback that a supervisor has given 
// req.query will contain the supervisor id 
// results are limited to 30. this can be a variable passed through the query if desired. 
router.get('/supervisors/count', (req, res) => {
  if (req.isAuthenticated()) {
    const supervisor = req.query.id;
    const startDate = req.query.start;
    const endDate = req.query.end;
    const query = `SELECT DISTINCT "person"."first_name", "person"."last_name", "feedback"."supervisor_id" as "sid",
                                (SELECT COUNT ("feedback"."quality_id")
                                FROM "feedback"
                                WHERE "feedback"."quality_id" = 2 AND "feedback"."supervisor_id" = $1 ) as instruct,
                                (SELECT COUNT ("feedback"."quality_id") 
                                FROM "feedback" 
                                WHERE "feedback"."quality_id" = 3 AND "feedback"."supervisor_id" = $1 ) as correct,
                                (SELECT COUNT ("feedback"."quality_id")
                                FROM "feedback" 
                                WHERE "feedback"."quality_id" = 1 AND "feedback"."supervisor_id" = $1 ) as praise
                        FROM "feedback" 
                        JOIN "quality_types" 
                        ON "quality_types"."id" = "feedback"."quality_id"
                        JOIN "person" 
                        ON "person"."id" = "feedback"."supervisor_id"
                        JOIN "employee" 
                        ON "employee"."id" = "feedback"."employee_id"
                        WHERE "feedback"."supervisor_id" = $1 AND "date_created" > $2 AND "date_created" < $3
                        GROUP BY "feedback"."quality_id", "feedback"."supervisor_id", "quality_types"."id", "person"."first_name", "person"."last_name"`;
    pool.query(query, [supervisor, startDate, endDate]).then((results) => {
      res.send(results.rows);
    }).catch((error) => {
      console.log('Error getting quality count data', error);
      res.sendStatus(500);
    })
  } else {
    res.sendStatus(403);
  }
})
router.get('/supervisors/reports', (req, res) => {
  if (req.isAuthenticated()) {
    const supervisor = req.query.id;
    const start = req.query.start;
    const end = req.query.end;
    const query = `SELECT  "feedback"."supervisor_id", ("person"."first_name" || ' ' || "person"."last_name") as supervisor, "feedback"."date_created", ( "employee"."first_name"  || ' ' || "employee"."last_name") as employee, "feedback"."details", "quality_types"."name" as "type"   
                        FROM "feedback" 
                        JOIN "quality_types"
                        ON "quality_types"."id" = "feedback"."quality_id"
                        JOIN "person"
                        ON "feedback"."supervisor_id" = "person"."id"
                        JOIN "employee" 
                        ON "feedback"."employee_id" = "employee"."id"
                        WHERE "feedback"."supervisor_id" = $1 AND "date_created" > $2 AND "date_created" < $3;`;
    pool.query(query, [supervisor, start, end]).then((results) => {
      res.send(results.rows);
    }).catch((error) => {
      console.log('Error getting reports', error);
      res.sendStatus(500);
    })
  } else {
    res.sendStatus(403);
  }
})
// gets all feedback for a specific employee where a manager ID or supervisor ID matches the req.user.id
// will need to do a full join with the feedback_images table to get all associated feedback images
// and a join to get all follow-up records for all employees if no feedback has been given after the follow-up date
// should set a limit of responses
router.get('/employee', (req, res) => {
  console.log('in GET /employee');
  const empFeedbackQuery = `SELECT "employee"."first_name", "date_created", "quality_types"."name", "details"
                                FROM "feedback" 
                                JOIN "quality_types"
                                ON "feedback"."quality_id" = "quality_types"."id"
                                JOIN "employee"
                                ON "feedback"."employee_id" = "employee"."id"
                                WHERE "employee_id" = 1 
                                ORDER BY "date_created" DESC`;
  pool.query(empFeedbackQuery)
    .then(result => res.send(result.rows))
    .catch(error => {
      console.log('error in GET /employee', error);
    });
});
//will get all feedback count for specific employee
router.get('/employeeFeedbackCount/1', (req, res) => {
  console.log('in GET /employeeFeedbackCount');
  const empFeedbackCntQuery = `SELECT DISTINCT
	                            (SELECT COUNT ("feedback"."quality_id")
	                            FROM "feedback" WHERE "feedback"."quality_id" = 1 AND "feedback"."employee_id" = 1) as Praise,
	                            (SELECT COUNT ("feedback"."quality_id")
	                            FROM "feedback" WHERE "feedback"."quality_id" = 2 AND "feedback"."employee_id" = 1) as Instruct,
	                            (SELECT COUNT ("feedback"."quality_id")
	                            FROM "feedback" WHERE "feedback"."quality_id" = 3 AND "feedback"."employee_id" = 1) as Correct
                                FROM "employee"
                                JOIN "feedback"
                                ON "feedback"."employee_id" = "employee"."id"
                                JOIN "quality_types"
                                ON "feedback"."quality_id" = "quality_types"."id"
                                WHERE "employee"."id" = 1
                                GROUP BY "employee"."id", "quality_types"."name";;`;
  pool.query(empFeedbackCntQuery)
    .then(result => res.send(result.rows))
    .catch(error => {
      console.log('error in GET /employeeFeedbackCount', error);
    });
});
//will get all of the feedback for the past 3-4 weeks count for the specific employee
router.get('/employeeWeeklyFeedbackCount/1', (req, res) => {
  console.log('in GET /ememployeeWeeklyFeedbackCount');
  const weeklyFeedbackQuery = `SELECT "date_created", "quality_types"."name"
                                    FROM "feedback" 
                                    JOIN "quality_types"
                                    ON "feedback"."quality_id" = "quality_types"."id"
                                    JOIN "employee"
                                    ON "feedback"."employee_id" = "employee"."id"
                                    WHERE "employee_id" = 1 
                                    AND "date_created" > CURRENT_DATE - INTERVAL '30' DAY
                                    ORDER BY "date_created" DESC;`;
  pool.query(weeklyFeedbackQuery)
    .then(result => res.send(result.rows))
    .catch(error => {
      console.log('error in GET /employeeWeeklyFeedbackCount', error);
    });
});
//will get all of the quarterly feedback count for the specific employee
router.get('/employeeQuarterlyFeedbackCount/1', (req, res) => {
  console.log('in GET /employeeQuarterlyFeedbackCount');
  const quarterlyFeedbackQuery = `SELECT "date_created", "quality_types"."name"
                                    FROM "feedback" 
                                    RIGHT JOIN "quality_types"
                                    ON "feedback"."quality_id" = "quality_types"."id"
                                    JOIN "employee"
                                    ON "feedback"."employee_id" = "employee"."id"
                                    WHERE "employee_id" = 1 
                                    AND "date_created" > CURRENT_DATE - INTERVAL '92' DAY
                                    ORDER BY "date_created" DESC;`;
  pool.query(quarterlyFeedbackQuery)
    .then(result => res.send(result.rows))
    .catch(error => {
      console.log('error in GET /employeeQuarterlyFeedbackCount', error);
    });
});
//will get all of the annually feedback for the specific employee
router.get('/employeeAnnuallyFeedbackCount/1', (req, res) => {
  console.log('in GET /employeeAnnuallyFeedbackCount');
  const annuallyFeedbackQuery = `SELECT "date_created", "quality_types"."name"
                                    FROM "feedback" 
                                    RIGHT JOIN "quality_types"
                                    ON "feedback"."quality_id" = "quality_types"."id"
                                    JOIN "employee"
                                    ON "feedback"."employee_id" = "employee"."id"
                                    WHERE "employee_id" = 1 
                                    AND "date_created" > CURRENT_DATE - INTERVAL '365' DAY
                                    ORDER BY "date_created" DESC;`;
  pool.query(annuallyFeedbackQuery)
    .then(result => res.send(result.rows))
    .catch(error => {
      console.log('error in GET /employeeAnnuallyFeedbackCount', error);
    });
});
// gets the most recent feedback record submitted where the req.user.id matches the manager ID
// used to display the confirmation record 
router.get('/confirmation', (req, res) => {

});
/**
 * POST routes 
 */
// posts a new feedback record
router.post('/', (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'supervisor') {
    const data = req.body;

    const queryText =
      `INSERT INTO "feedback" (
                "supervisor_id", 
                "employee_id", 
                "date_created", 
                "quality_id", 
                "task_related", 
                "culture_related", 
                "details"
            ) VALUES ($1, $2, to_timestamp($3 / 1000.0), $4, $5, $6, $7) RETURNING *;`;

    pool.query(queryText, [
      data.supervisorId,
      data.employeeId,
      data.dateCreated,
      data.quality_id,
      data.taskRelated,
      data.cultureRelated,
      data.details
    ]).then(response => {
      console.log(`/api/feedback POST success`);
      const newFeedbackRow = response.rows[0];
      res.send(newFeedbackRow);
    }).catch(error => {
      console.log(`/api/feedback POST error:`, error);
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(401);
  }
});
// adds images associated with a feedback record, using the ID of the feedback record
// this must occur after the feedback post   
router.post('/images', (req, res) => {

});
/**
 * PUT routes
 */
// edits a feedback record 
router.put('/', (req, res) => {
  if (req.isAuthenticated()) {
    const feedback = req.body
  } else {
    res.sendStatus(401);
  }
});
module.exports = router;