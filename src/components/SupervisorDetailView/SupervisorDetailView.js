import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

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
    } else if (!user.isLoading && user.userName && !this.state.feedbackHistory.length){
      // console.log('getting supervisor feedback');
      this.getSupervisorFeedback(this.props.match.params.personId);
    }
  }

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
    const { feedbackHistory } = this.state;
    return (
      <div>
        <SupervisorDetailAppBar />
        {/* <h2>supervisor detail view</h2>
        <button onClick={() => this.props.history.push('/dashboard')}>Back</button> */}
        <QuarterlySummary data={feedbackHistory} />
        <PastThreeWeeks data={feedbackHistory} />
        <PastTwelveMonths data={feedbackHistory} />
      </div>
    );
  }
}

export default connect(mapStateToProps)(SupervisorDetailView);