import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {FormControl, Input, Button, FormLabel, NativeSelect, Typography} from '@material-ui/core';
import './addperson.css'; 

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
    };
  }

  createSupervisor = (event) => {
    event.preventDefault();

    if (this.state.username === '' || this.state.password === '') {
      this.setState({
        message: 'Set a username and password!',
      });
    } else {
      
      const {
        username, 
        password, 
        employeeId, 
        first_name, 
        last_name, 
        email_address, 
        role_id
      } = this.state;

      const body = {
        username, 
        password, 
        employeeId, 
        first_name, 
        last_name, 
        email_address, 
        role_id
      };

      // making the request to the server to post the new user's registration
      axios.post('/api/user/register/', body)
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
                message: '',
            });
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
    }
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
            <div className="center">
            <Typography variant="display1">Add a Person</Typography>
            <br/>
            <FormLabel className="label-spacing">Role:</FormLabel>
                <NativeSelect value={this.state.role_id} onChange={(event)=>this.handleChangeFor('role_id', event)}>
                    <option value="">Select One</option>
                    <option value="1">Supervisor</option>
                    <option value="employee">Employee</option>  
                </NativeSelect>
            </div>
            {this.state.role_id === '1' && <div className="add-person-form">
            <Typography>Set up the supervisor's profile and create a username and password for them.</Typography>
            <br/>
                <FormControl>
                    <FormLabel>First Name</FormLabel>
                        <Input type="text"  onChange={(event)=>this.handleChangeFor('first_name', event)} required/>
                    <FormLabel>Last Name</FormLabel>
                        <Input type="text" onChange={(event)=>this.handleChangeFor('last_name', event)} required/>
                    <FormLabel>Employee ID</FormLabel>
                        <Input type="text" onChange={(event)=>this.handleChangeFor('employeeId', event)} required/>
                    <FormLabel>Email</FormLabel>
                        <Input type="text" onChange={(event)=>this.handleChangeFor('email_address', event)} required/>
                    <FormLabel>Username</FormLabel>
                        <Input type="text" onChange={(event)=>this.handleChangeFor('username', event)} required/>
                    <FormLabel>Password</FormLabel>
                        <Input type="text" onChange={(event)=>this.handleChangeFor('password', event)} required/>
                    <Button onClick={this.createSupervisor} variant="contained" color="primary">Submit</Button>
                    <Button onClick={this.props.history.push('/dashboard')}>Cancel</Button>
                </FormControl></div>}
            {this.state.role_id === "employee" && <p>employee setup</p>}
   </div>
    );
  }
}

export default AddPerson;
