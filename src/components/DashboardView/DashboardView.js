import React from 'react';
import { connect } from 'react-redux';
// import AppBar from './AppBar/AppBar'
import Nav from '../../components/Nav/Nav';
import { USER_ACTIONS } from '../../redux/actions/userActions';
import SupervisorDashboard from './SupervisorDashboard/SupervisorDashboard';
import ManagerDashboard from './ManagerDashboard/ManagerDashboard';
import { USER_ROLES } from '../../constants';

const mapStateToProps = state => ({
  user: state.user,
});

class DashboardView extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
  }

  componentDidUpdate() {
    if (!this.props.user.isLoading && this.props.user.userName === null) {
      this.props.history.push('/home');
    }
  }

  render(){
    const {user} = this.props;
    
    let userDashboard;
    if (user.role === USER_ROLES.SUPERVISOR) {
      userDashboard = <SupervisorDashboard history={this.props.history}/>
    } else if (user.role === USER_ROLES.MANAGER) {
      userDashboard = <ManagerDashboard history={this.props.history}/>
    }

    return (
      <div>
          {userDashboard}
        <Nav/>
      </div>
      
    )
  }
}

export default connect(mapStateToProps)(DashboardView);