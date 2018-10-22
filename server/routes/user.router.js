const express = require('express');
const { rejectUnauthenticated } = require('../modules/authentication-middleware');
const encryptLib = require('../modules/encryption');
const pool = require('../modules/pool');
const userStrategy = require('../strategies/user.strategy');
const moment = require('moment');
const router = express.Router();
const Chance = require('chance');
const chance = new Chance();
const transporter = require('../modules/nodemailer');

// Handles Ajax request for user information if user is authenticated
router.get('/', rejectUnauthenticated, (req, res) => {
  // Send back user object from database
  res.send(req.user);
});

// Handles POST request with new user data
// The only thing different from this and every other post we've seen
// is that the password gets encrypted before being inserted
router.post('/register', (req, res, next) => {
  console.log('req: ', req.body);
  
  const {
    username, 
    employeeId, 
    first_name, 
    last_name, 
    email_address, 
    role_id
  } = req.body;
  const password = encryptLib.encryptPassword(req.body.password);

  const queryText = `INSERT INTO person (
    "username", 
    "password",
    "employeeId",
    "first_name",
    "last_name",
    "email_address",
    "role_id"
  ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "id";`;
  pool.query(queryText, [
    username, 
    password,
    employeeId,
    first_name,
    last_name,
    email_address,
    role_id,
  ]).then(() => { res.sendStatus(201); })
    .catch((err) => { next(err); });
});

// Handles login form authenticate/login POST
// userStrategy.authenticate('local') is middleware that we run on this route
// this middleware will run our POST if successful
// this middleware will send a 404 if not successful
router.post('/login', userStrategy.authenticate('local'), (req, res) => {
  res.sendStatus(200);
});
router.put('/createtoken', (req, res) => {
  const email = req.body.email; // e-mail from the form
  const token = chance.hash(); // Create a unique token
  const today = req.body.today; 
  const expiration = moment(today).add(48, 'hours').format();
  console.log(expiration);
  // TODO: Include an expiration 48 hours in the future
  let queryText = `UPDATE "person" SET "token" = $1, "expiration" = $2 WHERE "email_address" = $3;`;
  pool.query(queryText, [token, expiration, email]).then((result) => {
    let mail = {
      from: "odissii <app.odissii@gmail.com>",
      to: `${req.body.email}`,
      subject: "odissii password reset",
      text: "You requested a password reset for your odissii login.",
      html: `<p>You requested a password reset for your odissii login.</p>
      <p>http://localhost:3000/#/reset/password/${token}</p>`
  }
  console.log(`http://localhost:3000/#/reset/password/${token}`);
  transporter.sendMail(mail, function(err, info) {
      if (err) {
          console.log('nodemailer error', err);
      } else {
          console.log("info.messageId: " + info.messageId);
          console.log("info.envelope: " + info.envelope);
          console.log("info.accepted: " + info.accepted);
          console.log("info.rejected: " + info.rejected);
          console.log("info.pending: " + info.pending);
          console.log("info.response: " + info.response);
      }
      transporter.close();
  })
    res.sendStatus(200);
  }).catch((error) => {
    console.log(error);
    res.sendStatus(500);
  });
})
router.put('/resetpassword', (req, res) => {
  const updates = req.body; 
  console.log(updates); 
  const password = encryptLib.encryptPassword(req.body.password);
  console.log(password); 
  const query = `UPDATE "person" SET "password" = $1, "expiration" = now(), "token" = 'null' 
                WHERE "token" = $2 AND "expiration" > now() AND "email_address" = $3;`;
  pool.query(query, [password, updates.token, updates.email_address]).then((results) => {
    res.sendStatus(200);
  }).catch((error) => {
    console.log('Error resetting password', error);
    res.sendStatus(500); 
  });
})
// clear all server session information about this user
router.get('/logout', (req, res) => {
  // Use passport's built-in method to log out the user
  req.logout();
  res.sendStatus(200);
});

module.exports = router;
