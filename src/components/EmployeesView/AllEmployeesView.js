import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import AllEmployeeAppBar from './EmployeeAppBar/AllEmployeeAppBar';
import AllEmployeeList from './EmployeeList/AllEmployeeList';
import Nav from '../../components/Nav/Nav';
import { Divider } from '@material-ui/core'
import { USER_ACTIONS } from '../../redux/actions/userActions';
import { USER_ROLES } from '../../constants';

const mapStateToProps = state => ({
    user: state.user,
})

class SupervisorEmployees extends React.Component {
    componentDidMount() {
        this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
    }

    // if user is no longer logged in this will send them to the login page
    componentDidUpdate() {
        if (!this.props.user.isLoading && this.props.user.userName === null) {
            this.props.history.push('/home');
        }
    }

    render() {
        let allEmployees;

        // conditional rendering so that only users with a manager role can see this view
        if (this.props.user.userName && this.props.user.role === USER_ROLES.MANAGER) {
            allEmployees = (
                <div>
                    <AllEmployeeAppBar />
                    <Divider />
                    <AllEmployeeList />
                </div>
            )
        }
        return (
            <div>
                {allEmployees}
                <Nav />
            </div>
        );
    }
}

export default withRouter(connect(mapStateToProps)(SupervisorEmployees));