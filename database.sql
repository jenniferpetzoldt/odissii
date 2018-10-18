-- The database should be called "odissii" when it is created.
-- The name of the database is recorded in server/modules/pool.js

-- role is a table of potential user roles within the application
-- initial values are "supervisor" and "manager"
CREATE TABLE role (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR (255) UNIQUE NOT NULL
);

INSERT INTO role ("name") VALUES ('supervisor'), ('manager');

-- the user of the application
-- identified as either a "supervisor" or "manager" by their "role_id"
CREATE TABLE person (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR (80) UNIQUE NOT NULL,
    "password" VARCHAR (1000) NOT NULL,
    "employeeId" VARCHAR (255) NOT NULL,
    "first_name" VARCHAR (255) NOT NULL,
    "last_name" VARCHAR (255) NOT NULL,
    "email_address" VARCHAR (500) NOT NULL,
    "role_id" INT NOT NULL REFERENCES "role",
    "token" varchar,
    "expiration" TIMESTAMP DEFAULT now()
);

-- junction table to link a "manager" person to a "supervisor" person
CREATE TABLE supervisor_manager (
  "id" SERIAL PRIMARY KEY,
  "manager_id" INT NOT NULL REFERENCES "person",
  "supervisor_id" INT NOT NULL REFERENCES "person"
);

-- junction table to link a "supervisor" person to an employee
CREATE TABLE supervisor_employee (
  "id" SERIAL PRIMARY KEY,
  "supervisor_id" INT NOT NULL REFERENCES "person",
  "employee_id" INT NOT NULL REFERENCES "employee"
);

-- table for employees, who are non-users for whom supervisors provide feedback
CREATE TABLE employee (
  "id" SERIAL PRIMARY KEY,
  "employeeId" VARCHAR (255) UNIQUE NOT NULL,
  "first_name" VARCHAR (255) NOT NULL,
  "last_name" VARCHAR (255) NOT NULL,
  "image_path" VARCHAR (255),
  "inactive" boolean DEFAULT false
);

-- Feedback entries created by one supervisor for one employee
-- includes information about the feedback itself, the date it was created,
-- an optional path for an image related to the feedback, an optional follow up date,
-- and the date of the most recent edit to this feedback, if any
CREATE TABLE feedback (
  "id" SERIAL PRIMARY KEY,
  "supervisor_id" INT NOT NULL REFERENCES "person",
  "employee_id" INT NOT NULL REFERENCES "employee",
  "date_created" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_DATE,
  "quality_id" INT NOT NULL REFERENCES "quality_types",
  "task_related" BOOLEAN DEFAULT false,
  "culture_related" BOOLEAN DEFAULT false,
  "details" VARCHAR NOT NULL,
  "date_edited" TIMESTAMPTZ
);

--defines each type of quality, assigned to feedback records 
CREATE TABLE quality_types (
  "id" serial primary key, 
  "name" varchar(50)
);
INSERT INTO "quality_types" ("name") VALUES ('praise'), ('instruct'), ('correct');

--a table for all of the images associated with feedback 
CREATE TABLE feedback_images (
	"id" SERIAL PRIMARY KEY, 
	"image_path" VARCHAR (255),
	"feedback_id" INT NOT NULL REFERENCES "feedback"
);

-- a table of reminders for a supervisor to follow up with an employee
CREATE TABLE follow_up (
  "id" SERIAL PRIMARY KEY,
  "employee_id" INT NOT NULL REFERENCES "employee",
  "follow_up_date" TIMESTAMPTZ,
  "completed" BOOLEAN DEFAULT false
);