const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const encryptLib = require('../modules/encryption');
/**
 * GET routes
 */
// get all supervisors associated with a superisor (req.user.id)
// should join with person and get first_name, last_name, username, person.id, role_id
router.get('/supervisors', (req, res) => {
    if (req.isAuthenticated) {
        const query = `SELECT "supervisor_id", "first_name", "last_name" FROM "supervisor_manager" JOIN "person" ON "supervisor_id" = "person"."id" WHERE "manager_id" = $1 ORDER BY "last_name";`;
        pool.query(query, [req.user.id]).then((results) => {
            res.send(results.rows);
        }).catch((error) => {
            console.log('Error getting supervisors', error);
            res.sendStatus(500);
        })
    } else {
        res.sendStatus(403);
    }

});
//gets a specific supervisor's profile to edit their details or delete them 
router.get('/supervisor/profile', (req, res) => {
    if(req.isAuthenticated){
        const supervisor = req.query.id;
        const query = `SELECT "id", "username", "first_name", "last_name", "employeeId", "email_address" FROM "person" WHERE "id" = $1;`;
        pool.query(query, [supervisor]).then((results) => {
            res.send(results.rows);
        }).catch((error) => {
            console.log('Error getting supervisor profile', error);
            res.sendStatus(500); 
        })
    } else {
        res.sendStatus(403); 
    }
})
//gets a specific employee's profile to edit their details or delete them
router.get('/employee/profile', (req, res) => {
    if(req.isAuthenticated){
        const employee = req.query.id;
        const query = `SELECT "employee"."id", "first_name", "last_name", "employee"."employeeId", "image_path", "inactive", "supervisor_employee"."supervisor_id" FROM "employee" JOIN "supervisor_employee" ON "employee_id" = "supervisor_employee"."employee_id" WHERE "employee"."id" = $1;`;
        pool.query(query, [employee]).then((results) => {
            res.send(results.rows);
        }).catch((error) => {
            console.log('Error getting employee profile', error);
            res.sendStatus(500); 
        })
    } else {
        res.sendStatus(403); 
    }
})
// get all employees associated with a supervisor
router.get('/employees/:id', (req, res) => {
    if (req.isAuthenticated()) {
        const query = `SELECT DISTINCT  ON ("employee"."id") "employee"."id", "employee"."employeeId", "employee"."first_name", 
        "employee"."last_name", "employee"."image_path", "supervisor_employee"."supervisor_id",  
        "employee"."id" IN (SELECT "employee_id" FROM "follow_up" WHERE "completed" = false) as incomplete, "feedback"."date_created"  as recent 
        FROM "feedback" 
        RIGHT JOIN "employee" ON "employee"."id" = "feedback"."employee_id"  
        LEFT JOIN "follow_up" ON "employee"."id" = "follow_up"."employee_id"
        RIGHT JOIN "supervisor_employee" ON "supervisor_employee"."employee_id" = "employee"."id"
        WHERE "supervisor_employee"."supervisor_id" = ($1) 
        ORDER BY  "employee"."id"ASC, recent DESC;`;
        pool.query(query, [req.params.id])
            .then((response) => {
                res.send(response.rows);
            }).catch((error) => {
                console.log('GET supervisors employees failed', error);
                res.sendStatus(500);
            });
    } else {
        res.sendStatus(403);
    }
});
//this is getting all employees that exist
router.get('/allEmployees', (req, res) => {
    if (req.isAuthenticated()) {
        const query = `SELECT DISTINCT  ON ("employee"."id") "employee"."id", "employee"."employeeId", "employee"."first_name", 
        "employee"."last_name", "employee"."image_path", "feedback"."date_created"  as recent 
        FROM "feedback" 
        RIGHT JOIN "employee" ON "employee"."id" = "feedback"."employee_id"  
        LEFT JOIN "follow_up" ON "employee"."id" = "follow_up"."employee_id"
        ORDER BY  "employee"."id"ASC, recent DESC;`;
        pool.query(query)
            .then((response) => {
                res.send(response.rows);
            }).catch((error) => {
                console.log('all employee GET failed', error);
                res.sendStatus(500);
            });
    } else {
        res.sendStatus(403);
    }
});
/**
 * POST routes 
 */
// creates a new employee in the employee table and returns its id
// then adds employee to manager_employee junction table
router.post('/employee', (req, res) => {
    if(req.isAuthenticated){
( async()=> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');     
        const employee = req.body;
        console.log(req.body);
        let query = `INSERT INTO "employee" ("employeeId", "first_name", "last_name", "image_path") VALUES ($1, $2, $3, $4) RETURNING "id";`;
        let values = [employee.employeeId, employee.first_name, employee.last_name, employee.image_path];
        let result = await client.query(query, values);
        let employeeID = result.rows[0].id;
        query = `INSERT INTO "supervisor_employee" ("employee_id", "supervisor_id") VALUES ($1, $2);`;
        const junctionInsert = await client.query(query, [employeeID, employee.supervisor_id]);
        await client.query('COMMIT');
            res.sendStatus(201);
        }catch(error){
            console.log('ROLLBACK', error);
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release;
        }
    })().catch((error)=>{
        console.log('CATCH', error);
        res.sendStatus(500);
    });
 } else {
        res.sendStatus(403);
    }
});

// creates a new supervisor in the person table 
// then adds supervisor to the manager_supervisor junction table
router.post('/register/supervisor', (req, res) => {
    if(req.isAuthenticated){
( async()=> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); 
        const {
            username, 
            employeeId, 
            first_name, 
            last_name, 
            email_address, 
            role_id
          } = req.body;
          const password = encryptLib.encryptPassword(req.body.password);
        
          let query = `INSERT INTO person (
            "username", 
            "password",
            "employeeId",
            "first_name",
            "last_name",
            "email_address",
            "role_id"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "id";`;
          let values = [ username, password, employeeId, first_name, last_name, email_address,role_id];
          const supervisorResult = await client.query(query, values);
          const supervisorId = supervisorResult.rows[0].id;
          query = `INSERT INTO "supervisor_manager" ("supervisor_id", "manager_id") VALUES ($1, $2);`;
          const result = await client.query(query, [supervisorId, req.user.id]);
          await client.query('COMMIT');
          res.sendStatus(201); 
    } catch(error){
        console.log('ROLLBACK', error);
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release;
    }
}) ().catch((error) => {
    console.log('CATCH', error);
    res.sendStatus(500);
});
} else {
    res.sendStatus(403);
}
});

/**
 * PUT routes
 */
// edits an employee's record 
router.put('/employee', (req, res) => {
    if (req.isAuthenticated){
        console.log('editing employee', req.body);
        ( async()=> {
            const client = await pool.connect();
            try {
                await client.query('BEGIN'); 
        const detailsToEdit = req.body; 
        console.log('req.body', detailsToEdit)
        let query = `UPDATE "employee" SET "first_name" = $1, "last_name" = $2, "employeeId" = $3, "image_path" = $4, "inactive" = $5 WHERE "id" = $6;`;
        console.log('query', query);
        const editResult = await client.query(query, [detailsToEdit.first_name, detailsToEdit.last_name, detailsToEdit.employeeId, detailsToEdit.image_path, detailsToEdit.inactive, detailsToEdit.id]);
        query = `UPDATE "supervisor_employee" SET "supervisor_id" = $1 WHERE "employee_id" = $2;`;
        const updateSupervisor = await client.query(query, [req.body.supervisor_id, req.body.employeeId]);
        await client.query('COMMIT');
        res.sendStatus(201); 
  } catch(error){
      console.log('ROLLBACK', error);
      await client.query('ROLLBACK');
      throw error;
  } finally {
      client.release;
      console.log('release'); 
  }
}) ().catch((error) => {
  console.log('CATCH', error);
  res.sendStatus(500);
});
} else {
  res.sendStatus(403);
}
});
// edits a supervisor's record in person table 
router.put('/supervisor', (req, res) => {
    if (req.isAuthenticated){
        const detailsToEdit = req.body; 
        console.log(detailsToEdit);
        const query = `UPDATE "person" SET "first_name" = $1, "last_name" = $2, "employeeId" = $3, "email_address" = $4, "username" = $5 WHERE "id" = $6;`;
        pool.query(query, [detailsToEdit.first_name, detailsToEdit.last_name, detailsToEdit.employeeId, detailsToEdit.email_address, detailsToEdit.username, detailsToEdit.id]).then((results)=>{
            res.sendStatus(200);
        }).catch((error) => {
            console.log('Error updating supervisor', error);
            res.sendStatus(500);
        })
    } else { 
        res.sendStatus(403);
    }
});

/**
 * DELETE routes
 */
//deletes employee from junction table and then deletes an employee's record 
router.delete('/employee', (req, res) => {
    if (req.isAuthenticated){
        const supervisorToDelete = req.query.id; 
    const query = `DELETE FROM "supervisor_employee" WHERE "employee_id" = $1;`;
    pool.query(query, [supervisorToDelete]).then((response) => {
    res.sendStatus(200);
 }).catch((error) => {
    console.log('CATCH', error); 
    res.sendStatus(500); 
})
    } else {
        res.sendStatus(403); 
    }
});
// deletes a supervisor/employee relationship then deletes a supervisor record
router.delete('/supervisor', (req, res) => {
    if (req.isAuthenticated){
        const supervisorToDelete = req.query.id; 
    const query = `DELETE FROM "supervisor_manager" WHERE "supervisor_id" = $1;`;
    pool.query(query, [supervisorToDelete]).then((response) => {
    res.sendStatus(200);
 }).catch((error) => {
    console.log('CATCH', error); 
    res.sendStatus(500); 
})
    } else {
        res.sendStatus(403); 
    }
});

module.exports = router;