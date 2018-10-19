import React, { Component } from 'react';
import { connect } from 'react-redux';
import { triggerLogin, formError, clearError } from '../../redux/actions/loginActions';
import { USER_ACTIONS } from '../../redux/actions/userActions';
import {Button, FormLabel, Input} from '@material-ui/core';


const mapStateToProps = state => ({
  user: state.user,
  login: state.login,
});

const styles = {
  button: {
      margin: 5,
      width: 30,
  },
}

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
            <FormLabel  htmlFor="username">
              Username:
              <Input
                type="text"
                name="username"
                value={this.state.username}
                onChange={this.handleInputChangeFor('username')}
              />
            </FormLabel>
          </div>
          <div>
            <FormLabel htmlFor="password">
              Password:
              <Input
                type="password"
                name="password"
                value={this.state.password}
                onChange={this.handleInputChangeFor('password')}
              />
            </FormLabel >
          </div>
          <div>
             <Button style={styles.button} type={'submit'} variant="contained">Login</Button>
             <br />
            <Button onClick={()=>this.props.history.push('/reset/password')}>Forgot Password?</Button>
            </div>
        </form>
            
      </div>
    );
  }
}

export default connect(mapStateToProps)(LoginPage);
