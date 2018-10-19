const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

router.get('/pending/all', (req, res) => {
  if (req.isAuthenticated()) {
    pool.query(`SELECT * FROM "follow_up" WHERE "completed" = false;`)
    .then(response => {
      console.log('/api/followup/pending GET success:', response.rows);
      res.send(response.rows);
    }).catch(error => {
      console.log('/api/followup/pending GET error:', error);
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(401);
  }
});

router.get('/pending/employee/:id', (req, res) => {
  if (req.isAuthenticated()) {
    const employeeId = req.params.id;
    const queryText = `
      SELECT * FROM "follow_up" 
      WHERE "completed" = false 
      AND "employee_id" = $1;
    `;

    pool.query(queryText, [employeeId])
    .then(response => {
      console.log(`/api/followup/pending/employee/${employeeId} GET success:`, response.rows);
      res.send(response.rows);
    }).catch(error => {
      console.log(`/api/followup/pending/employee/${employeeId} GET error:`, error);
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(401);
  }
});

// the body of this post should be an object with both employeeId and followUpDate
router.post('/', (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'supervisor') {
    const data = req.body;
    const queryText = `INSERT INTO "follow_up"
    ("employee_id", "follow_up_date") VALUES
    ($1, $2) RETURNING *;`

    pool.query(queryText, [data.employeeId, data.followUpDate])
    .then(response => {
      console.log('/api/followup POST success:', response);
      const newFollowup = response.rows[0];
      res.send(newFollowup);
    }).catch(error => {
      console.log('/api/followup POST error:', error);
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(401);
  }
});

router.put('/complete/:employeeId', (req, res) => {
  if (req.isAuthenticated()) {
    const employeeId = req.params.employeeId;
    const queryText = `UPDATE "follow_up" SET "completed" = true WHERE "employee_id" = $1;`;

    pool.query(queryText, [employeeId])
    .then(response => {
      console.log(`/api/folllowup/complete/${employeeId} PUT success:`, response);
      res.sendStatus(200);
    }).catch(error => {
      console.log(`/api/folllowup/complete/${employeeId} PUT error:`, error);
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;