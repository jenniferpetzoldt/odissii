# odissii
odissii is a full-stack, mobile first web application that allows supervisors to track the feedback they give to their employees to improve supervisor-employee relationships. There are two types of users of odissii: supervisors (people who directly oversee regular employees) and managers (people who oversee supervisors). odissii allows supervisors to record feedback for the employees they supervise and see visual representation of their history of feedback over time. Managers can see how all of their supervisors are doing in providing feedback to their employees. The reports generated from this application help managers doing quarterly or annual reviews and most importantly, help supervisors reflect on and document the feedback they are providing to their employees.  

## Built With
* React
* Redux
* Sagas
* Node
* Express
* PostgreSQL
* Nodemailer
* Charts.js
* Passport
* Moment.js
* Chance 
* Cloudinary
* Material UI
* Sweetalerts

## Getting Started
### Setup
1. Create a new database called odissii.
2. Use the database.sql file to create all of the tables you will need to run this project.
3. Start postgres if not running already by using ``brew services start postgresql``
4. ``npm install``
5. Create a .env file at the root of the project and paste this line into the file:
    SERVER_SESSION_SECRET=superDuperSecret
6. While you're in your new .env file, take the time to replace superDuperSecret with some long random string like 25POUbVtx6RKVNWszd9ERB9Bb6 to keep your application secure. Here's a site that can help you: https://passwordsgenerator.net/. If you don't do this step, create a secret with less than eight characters, or leave it as superDuperSecret, you will get a warning.
7. You will need to sign up for accounts with the Cloudinary and Nodemailer APIs and put your API keys in the .env file as well.
    Nodemailer: https://nodemailer.com/
    Cloudinary: https://cloudinary.com/documentation/react_integration 
8. ``npm run server``
9. Now that the server is running, start the client ``npm run client``
10. Navigate to ``localhost:3000``

## Screenshots

## Completed Features
- [x] Users (supervisors) can submit a feedback report after they have provided feedback to one of their employees. 
    - [x] Supervisors mark if the feeback is praise, instructive, or corrective; and task or culture related. They also provide a description of their feeback and note if a follow-up meeting is required (and when that follow-up should occur). 
- [x] After a feedback record is submitted, the supervisor will receive a confirmation email containing all of the details in the record. 
- [x] Supervisors can edit a feedback record within 72 hours of creating it. 
- [x] Supervisors can see a history of all of the feedback they have given over the past quarter, three weeks, and on their Dashboard. 
- [x] Supervisors can see a list of all of the employees they supervise and a history of all recent feedback in the Employee List View. 
- [x] The Employee List View is sortable and searchable. By default, it displays employees that need a follow-up at the top of the list.
- [x] Supervisors can see monthly, quarterly, and annual graphs of an individual employee's feedback in the Individual Employee List View. If they'd like to edit a record, they can do so by clicking on it in this list, if it has not been more than 72 hours since it was created.
- [x] Managers can see all of the supervisors that they manage on their Dashboard and graphs of the feedback that they have given over the past 12 months. 
- [x] Managers can view a list of all of the employees in their company and see when the last feedback was given to any employee, and if a follow-up is required.
- [x] Managers can download a .csv file of the last 12 months of feedback given by a supervisor to all of their employees.
- [x] Managers can create new supervisors and employees and they can also edit supervisor and employee profiles. 
- [x] Supervisors are assigned a temporary password by their manager but they are able to reset their password after their account has been created. 

## Authors
[@m2vang](https://github.com/m2vang), [@pheggeseth](https://github.com/pheggeseth), [@larsz-o](https://github.com/larsz-o), [@jenniferpetzoldt](https://github.com/jenniferpetzoldt)
