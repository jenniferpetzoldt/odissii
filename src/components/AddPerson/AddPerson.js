import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FormControl, Input, Button, FormLabel, NativeSelect, Typography } from '@material-ui/core';
import './addperson.css';
import { connect } from 'react-redux';
import AppBar from '../EmployeesView/EmployeeAppBar/AllEmployeeAppBar';
import swal from 'sweetalert';

const mapStateToProps = state => ({
  supervisor: state.people.staff.supervisors,
  user: state.user
});
class AddPerson extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      employeeId: '',
      first_name: '',
      last_name: '',
      email_address: '',
      role_id: '',
      message: '',
      supervisor_id: ''
    };
  }
  componentDidMount() {
    this.props.dispatch({ type: 'FETCH_SUPERVISORS' });
  }
  componentDidUpdate() {
    if (!this.props.user.isLoading && this.props.user.userName === null) {
      this.props.history.push('/home');
    }
  }
  createEmployee = () => {
    axios({
      method: 'POST',
      url: '/api/staff/employee',
      data: this.state
    }).then((response) => {
      swal(`${this.state.first_name} ${this.state.last_name} created!`);
      this.setState({
        username: '',
        password: '',
        employeeId: '',
        first_name: '',
        last_name: '',
        email_address: '',
        role_id: '',
        image_path: '',
        message: '',
      });
      this.props.dispatch({ type: 'FETCH_ALL_EMPLOYEES' });
    }).catch((error) => {
      console.log('Error creating employee', error);
      swal('Something went wrong. Please try again.');
    })

  }
  createSupervisor = (event) => {
    event.preventDefault();
    if (this.state.username === '' || this.state.password === '') {
      this.setState({
        message: 'Set a username and password!',
      });
    }
    // making the request to the server to post the new user's registration
    axios.post('/api/staff/register/supervisor', this.state)
      .then((response) => {
        if (response.status === 201) {
          alert('Supervisor registered!');
          this.setState({
            username: '',
            password: '',
            employeeId: '',
            first_name: '',
            last_name: '',
            email_address: '',
            role_id: '',
            image_path: '',
            message: '',
          });
          swal(`${this.state.first_name} ${this.state.last_name} created!`);
          this.props.dispatch({ type: 'FETCH_SUPERVISORS' });
        } else {
          this.setState({
            message: 'Oops! That didn\'t work. The username might already be taken. Try again!',
          });
        }
      })
      .catch(() => {
        this.setState({
          message: 'Oops! Something went wrong! Is the server running?',
        });
      });
  } // end createSupervisor

  handleChangeFor = (propertyName, event) => {
    this.setState({
      [propertyName]: event.target.value,
    });
  }

  renderAlert() {
    if (this.state.message !== '') {
      return (
        <h2
          className="alert"
          role="alert"
        >
          {this.state.message}
        </h2>
      );
    }
    return (<span />);
  }

  render() {
    return (
      <div>
        <AppBar />
        <div className="center">
          <Typography variant="display1">Add Staff</Typography>
          <br />
          <FormLabel className="label-spacing">Role:</FormLabel>
          <NativeSelect value={this.state.role_id} onChange={(event) => this.handleChangeFor('role_id', event)}>
            <option value="">Select One</option>
            <option value="1">Supervisor</option>
            <option value="employee">Employee</option>
          </NativeSelect>
        </div>

        {this.state.role_id === '1' && <div className="add-person-form">
          <Typography>Set up a supervisor's profile and create a username and password for them.</Typography>
          <br />
          <FormControl>
            <FormLabel>First Name</FormLabel>
            <Input type="text" onChange={(event) => this.handleChangeFor('first_name', event)} required />
          </FormControl>
          <FormControl>
            <FormLabel>Last Name</FormLabel>
            <Input type="text" onChange={(event) => this.handleChangeFor('last_name', event)} required />
          </FormControl>
          <FormControl>
            <FormLabel>Employee ID</FormLabel>
            <Input type="text" onChange={(event) => this.handleChangeFor('employeeId', event)} required />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="text" onChange={(event) => this.handleChangeFor('email_address', event)} required />
          </FormControl>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" onChange={(event) => this.handleChangeFor('username', event)} required />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" onChange={(event) => this.handleChangeFor('password', event)} required />
          </FormControl>
          <br /> <br />
          <Button onClick={this.createSupervisor} variant="contained" color="primary">Submit</Button>
          <Button onClick={() => this.props.history.push('/dashboard')}>Cancel</Button>
        </div>}
        {this.state.role_id === "employee" && <div className="add-person-form">
          <FormControl>
            <FormLabel>First Name</FormLabel>
            <Input type="text" onChange={(event) => this.handleChangeFor('first_name', event)} required />
          </FormControl>
          <FormControl>
            <FormLabel>Last Name</FormLabel>
            <Input type="text" onChange={(event) => this.handleChangeFor('last_name', event)} required />
          </FormControl>
          <FormControl>
            <FormLabel>Employee ID</FormLabel>
            <Input type="text" onChange={(event) => this.handleChangeFor('employeeId', event)} required />
          </FormControl>
          <FormControl>
            <FormLabel>Image</FormLabel>
            <Input type="text" onChange={(event) => this.handleChangeFor('image_path', event)} required />
          </FormControl>
          <FormControl>
            <FormLabel>Assign Supervisor</FormLabel>
            <NativeSelect onChange={(event) => this.handleChangeFor('supervisor_id', event)} required>
              <option value="">Select One</option>
              {this.props.supervisor.map((supervisor, i) => {
                return (
                  <option value={supervisor.supervisor_id}>{supervisor.first_name} {supervisor.last_name}</option>
                );
              })}
            </NativeSelect>
          </FormControl>
          <br /> <br />
          <Button onClick={this.createEmployee} variant="contained" color="primary">Submit</Button>
          <Button onClick={() => this.props.history.push('/dashboard')}>Cancel</Button>
        </div>}
      </div>
    );
  }
}

export default connect(mapStateToProps)(AddPerson);
