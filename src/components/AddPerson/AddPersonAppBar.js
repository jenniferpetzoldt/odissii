import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AppBar, Toolbar, IconButton} from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';

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
        color: '#f7fcff'
    }
}
class AddPersonAppBar extends React.Component {

    handleClick = (event) => {
        console.log('in handleClick');
        this.props.history.push('/dashboard');
        this.props.dispatch({ type: 'ADD_NAV_VALUE', payload: 'dashboard'});
    }
    render() {
        return (
            <AppBar position="sticky">
                <Toolbar>
                <IconButton onClick={this.handleClick}><ArrowBack style={styles.color}/></IconButton>
                    <h3>Add Staff</h3>
                    <div style={styles.grow} />
                </Toolbar>
            </AppBar>
        )
    }
}

export default withRouter(connect(mapStateToProps)(AddPersonAppBar));