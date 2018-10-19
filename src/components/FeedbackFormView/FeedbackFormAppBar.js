import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';


const mapStateToProps = state => ({
    user: state.user,
})

class FeedbackFormAppBar extends React.Component {

    handleClick = (event) => {
        console.log('in handleClick');
        this.props.history.push('/dashboard');
    }
    render() {
        return (
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton onClick={this.handleClick}><ArrowBack /></IconButton>
                    <Typography>New Feedback</Typography>
                </Toolbar>
            </AppBar>
        )
    }
}

export default withRouter(connect(mapStateToProps)(FeedbackFormAppBar));