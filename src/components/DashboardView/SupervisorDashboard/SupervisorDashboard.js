import React from 'react';
import { connect } from 'react-redux';
// import { USER_ACTIONS } from '../../../redux/actions/userActions';

import { Grid, Typography } from '@material-ui/core'; 
import { FEEDBACK_ACTIONS } from '../../../redux/actions/feedbackActions';

import PastTwelveMonths from './Graphs/PastTwelveMonths';
import QuarterlySummary from './Graphs/QuarterlySummary';
import PastThreeWeeks from './Graphs/PastThreeWeeks';

const mapStateToProps = state => ({
  user: state.user,
  feedbackHistory: state.feedback.feedback.allFeedbackBySupervisor,
});

class SupervisorDashboard extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: FEEDBACK_ACTIONS.FETCH_ALL_FEEDBACK_BY_CURRENT_SUPERVISOR
    });
  }

  render(){
    const { feedbackHistory } = this.props;
    return (
      <div className="padding-bottom">
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography variant="display1" className="center">{this.props.user.first_name}'s Dashboard</Typography>
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

export default connect(mapStateToProps)(SupervisorDashboard);