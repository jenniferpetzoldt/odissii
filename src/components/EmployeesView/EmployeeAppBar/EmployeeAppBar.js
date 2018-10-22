import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AppBar, Toolbar, IconButton, InputBase } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Search from '@material-ui/icons/Search';

const mapStateToProps = state => ({
    user: state.user,
})

const styles = {
    grow: {
        flexGrow: 1,
    },
    input: {
        width: 100,
    },
    color: {
        color: '#f7fcff',
    }
}

class EmployeeAppBar extends React.Component {
    // This updates redux with the search paramiters
    handleChange = (event) => {
        this.props.dispatch({ type: 'ADD_SEARCH', payload: event.target.value });
    }

    // When the back button is clicked the user is sent back to the dashboard view
    handleClick = (event) => {
        this.props.history.push('/dashboard');
        this.props.dispatch({ type: 'ADD_NAV_VALUE', payload: 'dashboard'});
    }
    render() {
        return (
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton onClick={this.handleClick}><ArrowBack style={styles.color}/></IconButton>
                    <h3>Employees</h3>
                    <div style={styles.grow} />
                    <div>
                        <Search />
                        <InputBase
                            style={styles.input}
                            placeholder="Search..."
                            onChange={this.handleChange} />
                    </div>
                </Toolbar>
            </AppBar>
        )
    }
}

export default withRouter(connect(mapStateToProps)(EmployeeAppBar));