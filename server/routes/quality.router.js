const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

router.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    pool.query('SELECT * FROM "quality_types";', [])
    .then(response => {
      console.log('/api/quality GET success');
      res.send(response.rows);
    }).catch(error => {
      console.log('/api/quality GET error:', error);
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;