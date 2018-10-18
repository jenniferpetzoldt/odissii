import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AppBar, Toolbar} from '@material-ui/core';

const mapStateToProps = state => ({
    user: state.user,
})

const styles = {
    grow: {
        flexGrow: 1,
    },
    input: {
        width: 100,
    }
}

class DashboardAppBar extends React.Component {
    handleChange = (event) => {
        this.props.dispatch({ type: 'ADD_SEARCH', payload: event.target.value });
    }

    handleClick = (event) => {
        console.log('in handleClick');
        this.props.history.push('/dashboard');
    }
    render() {
        return (
            <AppBar position="sticky">
                <Toolbar>
                    <div style={styles.grow} />
                </Toolbar>
            </AppBar>
        )
    }
}

export default withRouter(connect(mapStateToProps)(DashboardAppBar));