import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AppBar, Toolbar, IconButton } from '@material-ui/core';
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
                    <IconButton onClick={this.handleClick}><ArrowBack style={{color: '#f7fcff'}} /></IconButton>
                    <h3 style={{color: '#f7fcff'}}>New Feedback</h3>
                </Toolbar>
            </AppBar>
        )
    }
}

export default withRouter(connect()(FeedbackFormAppBar));