import React from 'react';
import { Grid, IconButton, Button, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import IndividualManagerGraph from './Graphs/IndividualManagerGraph';
import ManagerOverviewGraph from './Graphs/ManagerOverviewGraph';
import { connect } from 'react-redux';
import { USER_ACTIONS } from '../../../redux/actions/userActions';
import { PEOPLE_ACTIONS } from '../../../redux/actions/peopleActions';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import moment from 'moment';
import './ManagerDashboard.css';

const mapStateToProps = state => ({
  user: state.user,
  people: state.people,
});
class ManagerDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      supervisors: [],
      praise: [],
      correct: [],
      instruct: [],
      labels: [],
      reports: {},
      feedbackCounts: {},
    }
  }
  componentWillMount() {
    this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
    this.getSupervisors();
  } // end componentDidMount

  //navigates to a view where the Manager can edit a Supervisor's profile 
  editPerson = (id) => {
    this.props.history.push(`/edit/supervisor/${id}`);
  }// end editPerson

   // gets a list of all of the supervisors that are overseen by the logged in user (Manager)
  getSupervisors = () => {
    axios({
      method: 'GET',
      url: '/api/staff/supervisors'
    }).then((response) => {
      // set the supervisors to redux and sortSupervisors(), which filters the response.data to be more usable  
      this.props.dispatch({ type: PEOPLE_ACTIONS.SET_SUPERVISORS, payload: response.data });
      this.sortSupervisors(response.data);
    }).catch((error) => {
      console.log('Error getting supervisors', error);
    })
  }// end getSupervisors

  //this gets the past twelve months of feedback counting how many praise, instruct, and correct feedback each supervisor has given 
  //takes in an array of supervisors's IDs to get the counts for each supervisor that exists.
  getFeedback = (idArray) => {
    let today = new Date();
    let end = moment(today).format('L');
    let start = moment(today).subtract(1, 'year').format('L');
    for (let i = 0; i < idArray.length; i++) {
      axios({
        method: 'GET',
        url: `/api/feedback/supervisors/count?id=${idArray[i]}&start=${start}&end=${end}`
      }).then((response) => {
        let feedback = response.data[0];
        //if feedback exists, add it to the supervisor array on state, which already contains a list of supervisors and counts of praise, instruct, and correct (each starting at 0)
        if(feedback !== undefined){
          //find the index of the supervisors array where the supervisor ID matches the response from the server 
            let index = this.state.supervisors.findIndex(supervisor => supervisor.supervisor_id === feedback.sid);
            let supervisorFeedback = this.state.supervisors;
            //insert the response.data into the supervisors array at the index discovered above then reset the value of state to include these values 
            supervisorFeedback[index] = { ...supervisorFeedback[index], praise: parseInt(feedback.praise), instruct: parseInt(feedback.instruct), correct: parseInt(feedback.correct) };
            this.setState({
              supervisors: supervisorFeedback
            })
        }
        // run sortData() to count all praise, instruct, and correct feedback records for all supervisors, to be used in the Manager Overview graph 
        this.sortData();
      }).catch((error) => {
        console.log('Error getting feedback counts', error);
      })
    }
  }
  //this gets more detailed reports about each feedback given by a supervisor, breaking each record down into employee, the details given, and the quality of the feedback
  //this data is used in a CSV file which can be downloaded by a manager 
  getFeedbackDetails = (idArray) => {
    let today = new Date();
    let end = moment(today).format('L');
    let start = moment(today).subtract(1, 'year').format('L');
    idArray.map(id => axios({
      method: 'GET',
      url: `/api/feedback/supervisors/reports?id=${id}&start=${start}&end=${end}`
    }).then((response) => {
      this.setState({
        reports: {
          ...this.state.reports,
          [id]: response.data
        }
      })
    }).catch((error) => {
      console.log('Error getting feedback details', error);
    }))
  }
  navTo = (id) => {
    //clears feedback in redux to prevent duplicate information when navigating back and forth to this page 
    this.props.dispatch({ type: 'CLEAR_FEEDBACK' });
    //navigates to the supervisor edit page
    this.props.history.push(`/view/supervisor/${id}`);
  }
  //sends the ID of a supervisor to redux and then navigates the Manager to the "Employees" page. Upon that page load, the id is retrieved from redux and used to populate that view with a list of all of that supervisor's employees. 
  navToEmployees = (id) => {
    this.props.dispatch({ type: 'SET_SUPERVISOR_TO_VIEW', payload: { id: id } });
    this.props.history.push(`/employees/`);
  }
  // processes an array of supervisors in three ways: 
  //1. alphabetizes all supervisors and places the results into an object, starting all praise/instruct/correct counts at 0. supervisors array is used to create the cards displaying on the DOM for each supervisor
  //2. creates a labels array which is used to label the manager overview bar chart 
  //3. creates an ID array which contains the ID of each supervisor. This is used to make axios requests for detailed feedback counts for each supervisor. 
  sortSupervisors = (array) => {
    let supervisors = [];
    let IDs = [];
    let labels = []
    for (let i = 0; i < array.length; i++) {
      supervisors.push({ first_name: array[i].first_name, last_name: array[i].last_name, supervisor_id: array[i].supervisor_id, praise: 0, instruct: 0, correct: 0 });
      IDs.push(array[i].supervisor_id);
      labels.push(array[i].last_name + ', ' + array[i].first_name);
    }
    this.setState({
      ...this.state,
      supervisors: supervisors,
      labels: labels
    });
    //calls two functions to get counts of feedback and full feedback details for each supervisor 
    this.getFeedback(IDs);
    this.getFeedbackDetails(IDs);
  }
  // maps through supervisors array in state, extracts the count of praise, instructive, and corrective feedback, and stores each category in an array. 
  // these arrays are used to create the manager overview graph 
  sortData = () => {
    let praise = this.state.supervisors.map(supervisor => supervisor.praise);
    let instruct = this.state.supervisors.map(supervisor => supervisor.instruct);
    let correct = this.state.supervisors.map(supervisor => supervisor.correct);
      this.setState({
        praise: praise,
        correct: correct,
        instruct: instruct,
      });
    }
  render() {
    return (
      <div className="padding-bottom">
        <Grid container spacing={0} >
          <Grid item xs={12}>
            <Typography variant="display1" className="center">{this.props.user.first_name}'s Dashboard</Typography>
            <Typography variant="subheading" className="center">Feedback given past 12 months</Typography>
          </Grid>
          <Grid item xs={12}>
            <ManagerOverviewGraph supervisors={this.state.labels} praise={this.state.praise} correct={this.state.correct} instruct={this.state.instruct} />
          </Grid>
          <Grid item xs={12}>
            <br />
            <Typography variant="headline" className="center">All Supervisors</Typography>
            <br />
          </Grid>
            <div className="card-container">
          {this.state.supervisors.map((supervisor, i) => {
            return (
                  <div className="card" key={i}>
                    <Typography variant="headline">{supervisor.first_name} {supervisor.last_name} <IconButton onClick={() => this.editPerson(supervisor.supervisor_id)}><Edit /></IconButton></Typography>
                    <Button color="primary" onClick={() => this.navTo(supervisor.supervisor_id)}>Summary</Button>
                    <Button color="primary" onClick={() => this.navToEmployees(supervisor.supervisor_id)}>Employees</Button>
                    <Typography>Feedback given past 12 months</Typography>
                    <IndividualManagerGraph feedback={supervisor} />
                    {this.state.reports[supervisor.supervisor_id] && <CSVLink data={this.state.reports[supervisor.supervisor_id]}
                      filename={`${supervisor.last_name}-feedback.csv`}
                      target="_blank"
                    >Download CSV</CSVLink>}
                  </div>
                );
              })}
            </div>
        </Grid>
     </div>
    );
  }
}
export default connect(mapStateToProps)(ManagerDashboard);