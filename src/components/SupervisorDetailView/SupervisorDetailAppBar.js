import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AppBar, Toolbar, IconButton } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';

// const mapStateToProps = state => ({
//   user: state.user,
// });

class SupervisorDetailAppBar extends React.Component {
  handleClick = (event) => {
    this.props.history.push('/dashboard');
  };

  render() {
    return (
      <AppBar position="sticky">
        <Toolbar>
          <IconButton onClick={this.handleClick}><ArrowBack style={{color: '#f7fcff'}} /></IconButton>
          <h3 style={{color: '#f7fcff'}}>Supervisor Detail</h3>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(connect()(SupervisorDetailAppBar));