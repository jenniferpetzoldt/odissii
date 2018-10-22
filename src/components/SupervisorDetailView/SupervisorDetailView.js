import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { Grid, Typography } from '@material-ui/core';

import { USER_ACTIONS } from '../../redux/actions/userActions';
import { USER_ROLES } from '../../constants';

import SupervisorDetailAppBar from './SupervisorDetailAppBar';
import QuarterlySummary from '../DashboardView/SupervisorDashboard/Graphs/QuarterlySummary';
import PastThreeWeeks from '../DashboardView/SupervisorDashboard/Graphs/PastThreeWeeks';
import PastTwelveMonths from '../DashboardView/SupervisorDashboard/Graphs/PastTwelveMonths';

const mapStateToProps = state => ({
  user: state.user,
  feedbackHistory: state.feedback.feedback.allFeedbackBySupervisor,
});

class SupervisorDetailView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      supervisor: {},
      feedbackHistory: []
    };
  }

  componentDidMount() {
    this.props.dispatch({type: USER_ACTIONS.FETCH_USER});
  }

  componentDidUpdate() {
    const { user, history } = this.props;

    if (!user.isLoading && user.userName === null) {
      history.push('/home');
    } else if (!user.isLoading && user.userName && user.role !== USER_ROLES.MANAGER) {
      history.push('/dashboard');
    } else if (!user.isLoading && user.userName) {
      if (!Object.keys(this.state.supervisor).length) {
        this.getSupervisorInformation(this.props.match.params.personId);
      }
      if (!this.state.feedbackHistory.length) {
        // console.log('getting supervisor feedback');
        this.getSupervisorFeedback(this.props.match.params.personId);
      }
    }
  }

  getSupervisorInformation = supervisorId => {
    axios.get(`/api/staff/supervisor/profile?id=${supervisorId}`)
    .then(response => {
      console.log('got supervisor profile');
      this.setState({
        supervisor: response.data[0]
      });
    }).catch(error => {
      console.log(`/api/staff/supervisor/profile?id=${supervisorId} GET request error:`, error);
    });
  };

  getSupervisorFeedback = supervisorId => {
    axios.get(`/api/feedback/supervisor/${supervisorId}`)
    .then(response => {
      this.setState({
        feedbackHistory: response.data
      });
    }).catch(error => {
      console.log(`/api/feedback/supervisor/${supervisorId} GET request error:`, error);
    });
  };

  render() {
    const { supervisor, feedbackHistory } = this.state;
    return (
      <div>
        <SupervisorDetailAppBar />
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography variant="display1" className="center">{supervisor.first_name && `${supervisor.first_name} ${supervisor.last_name}`}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subheading" className="center">Feedback given in the past quarter</Typography>
            <QuarterlySummary data={feedbackHistory} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subheading" className="center">Feedback given in the past three weeks</Typography>
            <PastThreeWeeks data={feedbackHistory} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subheading" className="center">Feedback given in the past twelve months</Typography>
            <PastTwelveMonths data={feedbackHistory} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default connect(mapStateToProps)(SupervisorDetailView);