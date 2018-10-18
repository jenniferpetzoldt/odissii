import React from 'react';
import { Grid, IconButton, Button, Typography} from '@material-ui/core'; 
import { Edit } from '@material-ui/icons';
import IndividualManagerGraph from './Graphs/IndividualManagerGraph';
import ManagerOverviewGraph from './Graphs/ManagerOverviewGraph'; 
import { connect } from 'react-redux';
import { USER_ACTIONS } from '../../../redux/actions/userActions';
import { PEOPLE_ACTIONS } from '../../../redux/actions/peopleActions'; 
import { FEEDBACK_ACTIONS } from '../../../redux/actions/feedbackActions';
import axios from 'axios';
import {CSVLink} from 'react-csv';
import moment from 'moment';
import './ManagerDashboard.css';

const mapStateToProps = state => ({
  user: state.user,
  people: state.people,
});

class ManagerDashboard extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        sortedSupervisors: [],
        praise: [],
        correct: [],
        instruct: [], 
        feedbackCounts: [], 
        reports: {}
      }
  }
  componentWillMount(){
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
      this.props.dispatch({type: PEOPLE_ACTIONS.SET_SUPERVISORS, payload: response.data});
      this.getSupervisorFeedbackReports(response.data); 
      this.sortSupervisors(response.data);
    }).catch((error) => {
      console.log('Error getting supervisors', error); 
    })
  }
  //this gets the past twelve months of feedback counting how many praise, instruct, and correct feedback each supervisor has given 
  getFeedbackCounts = (id) => {
    let today = new Date();
    let end = moment(today).format('L');
    let start = moment(today).subtract(1, 'year').format('L');  
    axios({
      method: 'GET',
      url: `/api/feedback/supervisors/count?id=${id}&start=${start}&end=${end}`
    }).then((response) => {
      let feedback = [...this.state.feedbackCounts, response.data];
      console.log(feedback);
      feedback.sort(function(a, b){
        let nameA = a[0].last_name;
        let nameB = b[0].last_name;
        if(nameA < nameB) return -1;
        if(nameA > nameB) return 1;
        return 0;
    });
    this.setState({
      feedbackCounts: feedback
    })
        this.sortData(response.data); 
      }).catch((error) => {
      console.log('Error getting feedback counts', error); 
    })
  }
  //this gets more detailed reports about each feedback given by a supervisor, breaking each record down into employee, the details given, and the quality of the feedback
  //this data is used in a CSV file which can be downloaded by a manager 
  getFeedbackDetails = (id) => {
      let today = new Date();
      let end = moment(today).format('L');
      let start = moment(today).subtract(1, 'year').format('L');  
    axios({
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
    })
  }
  //this sorts the feedback and extracts each supervisor ID to send to two functions which GET two sets of feedback data 
  getSupervisorFeedbackReports = (array) => {
    for (let i = 0; i < array.length; i++){
      let id = array[i].supervisor_id; 
      this.getFeedbackCounts(id); 
      this.getFeedbackDetails(id);
    }
  }
  navTo = (id) => {
    //clears feedback in redux to prevent duplicate information when navigating back and forth to this page 
    this.props.dispatch({type: 'CLEAR_FEEDBACK'});
    //navigates to the supervisor edit page
    this.props.history.push(`/view/supervisor/${id}`);
  }
  navToEmployees = () => {
    this.props.history.push('/employees');
  }
  sortSupervisors = (array) => {
    let sortedSupervisors = [];
    for(let i = 0; i < array.length; i++){
     sortedSupervisors.push(array[i].last_name + ', ' + array[i].first_name );
     console.log(sortedSupervisors);
     sortedSupervisors.sort(function(a, b){
      let nameA = a[0];
      let nameB = b[0];
      if(nameA < nameB) return -1;
      if(nameA > nameB) return 1;
      return 0;
  });
    }
    this.setState({
      sortedSupervisors: sortedSupervisors
    })
  }
  sortData = (array) => {
    for(let i = 0; i < array.length; i++){
          this.setState({
            praise: [...this.state.praise, parseInt(array[i].praise)],
            correct: [...this.state.correct, parseInt(array[i].correct)],
            instruct: [...this.state.instruct, parseInt(array[i].instruct)],
          })   
        }
    }
  render(){
    return (
      <div className="padding-bottom">
        <Grid container spacing={0}>
        <Grid item xs={12}>
          <Typography variant="display1" className="center">{this.props.user.first_name}'s Dashboard</Typography>
            <Typography variant="subheading" className="center">Feedback given past 12 months</Typography>
            </Grid>
            <Grid item xs={12}>
              <ManagerOverviewGraph supervisors={this.state.sortedSupervisors} praise={this.state.praise} correct={this.state.correct} instruct={this.state.instruct}/> 
            </Grid>
          <Grid item xs={12}>
          <br/>
              <Typography variant="headline" className="center">All Supervisors</Typography>
              <br/>
          </Grid>
                {this.state.feedbackCounts.map((array, i) => {
                        return(
                        <div key={i}>
                         {array.map((feedback, j)=> {
                              return(
                              <Grid item xs={12} lg={8} key={j}>
                              <div className="card-container">
                                <div className="card">
                                      <Typography variant="headline">{feedback.first_name} {feedback.last_name} <IconButton onClick={()=> this.editPerson(feedback.sid)}><Edit/></IconButton></Typography>
                                      <Button color ="primary" onClick={()=>this.navTo(feedback.sid)}>Summary</Button>
                                      <Button color ="primary" onClick={this.navToEmployees}>Employees</Button>
                                       <Typography>Feedback given past 12 months</Typography>
                                        <IndividualManagerGraph feedback={feedback}/> 
                                        {this.state.reports[feedback.sid] && <CSVLink data={this.state.reports[feedback.sid]}
                                          filename={`${feedback.last_name}-feedback.csv`}
                                          target="_blank"
                                        >Download CSV</CSVLink>}
                              </div>
                            </div>
                        </Grid>
                      );
                  })} 
                  </div> 
              );
            })}
    </Grid>
    </div>
    );
  }
}
export default connect(mapStateToProps)(ManagerDashboard);