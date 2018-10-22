import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { USER_ACTIONS } from '../../redux/actions/userActions';
import { USER_ROLES } from '../../constants';
import { triggerLogout } from '../../redux/actions/loginActions';
import { BottomNavigation, BottomNavigationAction, Button, Grid } from '@material-ui/core';
import Group from '@material-ui/icons/Group';
import PersonAdd from '@material-ui/icons/PersonAdd';
import Create from '@material-ui/icons/Create';
import ShowChart from '@material-ui/icons/ShowChart';

const mapStateToProps = state => ({
  user: state.user,
  nav: state.nav,
})

const styles = {
  stickToBottom: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    left: 0,
  },
};

class Nav extends Component {


  componentDidMount() {
    this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
  }

handleChange = (event, value) => {
  this.props.dispatch({ type: 'ADD_NAV_VALUE', payload: value});
}

  // logs user out on click of the button within the navbar
  logout = () => {
    this.props.dispatch(triggerLogout());
    console.log('in logout click');
  }

  render() {
    let content = null;
    
    // if manager logged in, will render appropriate nav bar
    if (this.props.user && this.props.user.role === USER_ROLES.MANAGER) {
      content = (
        <BottomNavigation value={this.props.nav} style={styles.stickToBottom} onChange={this.handleChange}>
          <BottomNavigationAction className="nav" label="Dashboard" value="dashboard" icon={<ShowChart />} component={Link} to={"/dashboard"} />
          <BottomNavigationAction className="nav" label="Employeees" value="employees" icon={<Group />} component={Link} to={"/allEmployees"} />
          <BottomNavigationAction className="nav" label="Add Staff" value="staff" icon={<PersonAdd />} component={Link} to={"/addperson"} />
          <BottomNavigationAction className="nav" icon={<Button>Logout</Button>} onClick={this.logout} />
        </BottomNavigation>
      )
      // if supervisor logged in, will render appropriate nav bar
    } else if (this.props.user && this.props.user.role === USER_ROLES.SUPERVISOR) {
      content = (
        <BottomNavigation value={this.props.nav} style={styles.stickToBottom} onChange={this.handleChange}>
          <BottomNavigationAction className="nav" label="Dashboard" value="dashboard" icon={<ShowChart />} component={Link} to={"/dashboard"} />
          <BottomNavigationAction className="nav" label="Employees" value="employees" icon={<Group />} component={Link} to={"/employees"} />
          <BottomNavigationAction className="nav" label="Feedback" value="feedback" icon={<Create />} component={Link} to={"/feedback/new"} />
          <BottomNavigationAction className="nav" icon={<Button>Logout</Button>} onClick={this.logout} />
        </BottomNavigation>
      )
    }
    return (
      <Grid>
        {content}
      </Grid>
    )
  }
}

export default connect(mapStateToProps)(Nav);
