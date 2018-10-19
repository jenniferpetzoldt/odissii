import React from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

import GridContainer from './components/GridContainer/GridContainer';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import DashboardView from './components/DashboardView/DashboardView';
import AllEmployeesView from './components/EmployeesView/AllEmployeesView';
import EmployeesView from './components/EmployeesView/EmployeesView';
import IndividualEmployeeSummaryView from './components/EmployeesView/IndividualEmployeeSummaryView/IndividualEmployeeSummaryView';
import FeedbackFormView from './components/FeedbackFormView/FeedbackFormView';
import FeedbackFormConfirmationView from './components/FeedbackFormConfirmationView/FeedbackFormConfirmationView';
import FeedbackDetailView from './components/FeedbackDetailView/FeedbackDetailView';
import EmployeeFormView from './components/EmployeeFormView/EmployeeFormView';
import UserPage from './components/UserPage/UserPage';
import EditSupervisor from './components/EditPerson/EditSupervisor'; 
import EditEmployee from './components/EditPerson/EditEmployee'; 
import AddPerson from './components/AddPerson/AddPerson'; 
import SupervisorDetailView from './components/SupervisorDetailView/SupervisorDetailView';
import ResetPassword from './components/ResetPassword/ResetPassword'; 
import NewPassword from './components/ResetPassword/NewPassword/NewPassword';
import './styles/main.css';

const App = () => (
  <GridContainer>
    <Router>
      <Switch>
        <Redirect exact from="/" to="/home" />
        <Route
          path="/home"
          component={LoginPage}
        />
        <Route
          path="/register"
          component={RegisterPage}
        />
        <Route 
          path="/dashboard"
          component={DashboardView}
        />
        <Route 
          path="/employees"
          component={EmployeesView}
        />
        <Route 
          path="/allEmployees"
          component={AllEmployeesView}
        />
        <Route
          path="/individualEmployee"
          component={IndividualEmployeeSummaryView}
        />
        <Route 
          path="/feedback/new"
          component={FeedbackFormView}
        />
        <Route 
          path="/feedback/confirmation"
          component={FeedbackFormConfirmationView}
        />
        <Route 
          path="/feedback/detail/:feedbackId"
          component={FeedbackDetailView}
        />
        <Route 
          path="/employee/new"
          component={EmployeeFormView}
        />
        <Route
          path="/user"
          component={UserPage}
        />
        <Route
          path="/addperson"
          component={AddPerson}
        />
        <Route
          exact path="/reset/password"
          component={ResetPassword}
        />
        <Route 
          path="/view/supervisor/:personId"
          component={SupervisorDetailView}
        />
        <Route 
        path="/edit/supervisor/:personId" 
        component={EditSupervisor}/>
       <Route 
        path="/edit/employee/:personId" 
        component={EditEmployee}/>
         <Route 
        exact path="/reset/password/:token" 
        component={NewPassword}/>
      <Route render={() => <h1>404</h1>} />
      </Switch>
    </Router>
  </GridContainer>
);

export default App;
