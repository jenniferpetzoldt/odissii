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
  }
  editPerson = (id) => {
    this.props.history.push(`/edit/supervisor/${id}`);
  }
  getSupervisors = () => {
    axios({
      method: 'GET',
      url: '/api/staff/supervisors'
    }).then((response) => {
      this.props.dispatch({ type: PEOPLE_ACTIONS.SET_SUPERVISORS, payload: response.data });
      this.sortSupervisors(response.data);
    }).catch((error) => {
      console.log('Error getting supervisors', error);
    })
  }
  //this gets the past twelve months of feedback counting how many praise, instruct, and correct feedback each supervisor has given 
  getFeedback = (idArray) => {
    let today = new Date();
    let end = moment(today).format('L');
    let start = moment(today).subtract(1, 'year').format('L');
    for (let i = 0; i < idArray.length; i++) {
      axios({
        method: 'GET',
        url: `/api/feedback/supervisors/count?id=${idArray[i]}&start=${start}&end=${end}`
      }).then((response) => {
        // assign the praise/instruct/correct counts to the specific supervisor
        // finds the index of the supervisors array in local state and assigns the values of praise/instruct/correct to the right supervisor based on the response from the server
        let feedback = response.data[0];
        //if feedback exists, add it to the supervisor array on state 
        if(feedback !== undefined){
            let index = this.state.supervisors.findIndex(supervisor => supervisor.supervisor_id === feedback.sid);
            let supervisorFeedback = this.state.supervisors;
            supervisorFeedback[index] = { ...supervisorFeedback[index], praise: parseInt(feedback.praise), instruct: parseInt(feedback.instruct), correct: parseInt(feedback.correct) };
            this.setState({
              supervisors: supervisorFeedback
            })
        }
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
  navToEmployees = (id) => {
    this.props.dispatch({ type: 'SET_SUPERVISOR_TO_VIEW', payload: { id: id } });
    //need to dispatch the supervisor's id to redux and then push to it 
    this.props.history.push(`/employees/`);
  }
  //this alphabetizes all supervisors and places the results into an object, starting all praise/instruct/correct counts at 0 
  // labels array is used to label the manager overview bar chart 
  sortSupervisors = (array) => {
    let supervisors = [];
    let IDs = [];
    let labels = []
    for (let i = 0; i < array.length; i++) {
      supervisors.push({ first_name: array[i].first_name, last_name: array[i].last_name, supervisor_id: array[i].supervisor_id, praise: 0, instruct: 0, correct: 0 });
      IDs.push(array[i].supervisor_id);
      labels.push(array[i].last_name + ', ' + array[i].first_name);
    }
    //need this array to map over where there are 0 
    this.setState({
      ...this.state,
      supervisors: supervisors,
      labels: labels
    });
    this.getFeedback(IDs);
    this.getFeedbackDetails(IDs);
  }
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