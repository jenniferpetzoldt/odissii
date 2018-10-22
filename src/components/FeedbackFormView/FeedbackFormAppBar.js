import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';

const styles = {
    color: {
        color: '#f7fcff',
    },
}

class FeedbackFormAppBar extends React.Component {
    handleClick = (event) => {
        this.props.history.push('/employees');
        this.props.dispatch({ type: 'ADD_NAV_VALUE', payload: 'employees'});
    };

    render() {
        return (
            <AppBar position="sticky" >
                <Toolbar>
                    <IconButton onClick={this.handleClick}><ArrowBack style={styles.color}/></IconButton>
                    <h3>New Feedback</h3>
                </Toolbar>
            </AppBar>
        )
    }
}

export default withRouter(connect()(FeedbackFormAppBar));