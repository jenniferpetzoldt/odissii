import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { triggerLogin, formError, clearError } from '../../redux/actions/loginActions';
import { USER_ACTIONS } from '../../redux/actions/userActions';
import {Button} from '@material-ui/core';


const mapStateToProps = state => ({
  user: state.user,
  login: state.login,
});

class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };
  }
  componentDidMount() {
    // starts request for server to check that we are logged in
    this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
    this.props.dispatch(clearError());
  }
  componentDidUpdate() {
    // if we have a response from the server and the user is logged in, redirect to the /user URL
    if (!this.props.user.isLoading && this.props.user.userName !== null) {
      this.props.history.push('/dashboard');
    }
  }
  login = (event) => {
    event.preventDefault();
    console.log('logging in')
    if (this.state.username === '' || this.state.password === '') {
      this.props.dispatch(formError());
    } else {
      console.log('in the else statement')
      this.props.dispatch(triggerLogin(this.state.username, this.state.password));
    }
  }
  handleInputChangeFor = propertyName => (event) => {
    this.setState({
      [propertyName]: event.target.value,
    });
  }
  renderAlert() {
    if (this.props.login.message !== '') {
      return (
        <h2
          className="alert"
          role="alert"
        >
          {this.props.login.message}
        </h2>
      );
    }
    return (<span />);
  }

  render() {
    return (
      <div>
        {this.renderAlert()}
        <form onSubmit={this.login}>
          <h1>Login</h1>
          <div>
            <label htmlFor="username">
              Username:
              <input
                type="text"
                name="username"
                value={this.state.username}
                onChange={this.handleInputChangeFor('username')}
              />
            </label>
          </div>
          <div>
            <label htmlFor="password">
              Password:
              <input
                type="password"
                name="password"
                value={this.state.password}
                onChange={this.handleInputChangeFor('password')}
              />
            </label>
          </div>
          <div>
            <Button type={'submit'} variant="contained">Submit</Button>
            <Link to="/register">Register</Link><br/>
            <Link to="/reset/password">Forgot Password</Link>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps)(LoginPage);
