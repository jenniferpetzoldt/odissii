import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { USER_ACTIONS } from '../../redux/actions/userActions';

import Nav from '../../components/Nav/Nav';
import SupervisorEmployees from './SupervisorEmployees/SupervisorEmployees';

const mapStateToProps = state => ({
  user: state.user,
});

class EmployeesView extends React.Component {

  componentDidMount() {
    this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
  }

  // if user is not longer logged in this redirects them to the login page
  componentDidUpdate() {
    if (!this.props.user.isLoading && this.props.user.userName === null) {
      this.props.history.push('/home');
    }
  }

  render() {
    let userEmployees;
    // not limited by role type because this content is used under both roles
    if (this.props.user.userName) {
      userEmployees = (
        <SupervisorEmployees />
      )
    }
    return (
      <div>
        {userEmployees}
        <Nav />
      </div>

    );
  }
}

//withRouter allows components not directly connected to the router to access history.push
export default withRouter(connect(mapStateToProps)(EmployeesView));