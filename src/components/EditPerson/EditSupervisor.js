import React, { Component } from 'react';
import axios from 'axios';
import { FormControl, FormLabel, Input, Button } from '@material-ui/core';
import './editperson.css';
import swal from 'sweetalert';
import { connect } from 'react-redux';
import { PEOPLE_ACTIONS } from '../../redux/actions/peopleActions';
import AppBar from './EditPersonAppBar/EditSupervisorAppBar';

const styles = {
    formControl: {
        marginRight: 20,
        padding: 10,
        margin: 5
    },
}
class EditSupervisor extends Component {
    constructor(props) {
        super(props);
        //the values of state will be populated after the component mounts and does an axios request to get the supervisor's information.
        //then, the input fields will be filled with the supervisor's information (from state)
        this.state = {
            supervisor: {}
        }
    }
    //when the component mounts, an axios call will go out to get information about the supervisor whose ID was included in the route parameters
    componentDidMount = () => {
        const { match: { params } } = this.props;
        axios.get(`/api/staff/supervisor/profile?id=${params.personId}`)
            .then((response) => {
                this.setState({
                    supervisor: response.data[0]
                });
            }).catch((error) => {
                console.log('Error getting supervisor', error);
            });
    };// end componentDidMount

  //if no one is logged in, push back to login page 
  componentDidUpdate() {
    if (!this.props.user.isLoading && this.props.user.userName === null) {
      this.props.history.push('/home');
    }
  }//end componentDidUpdate
  
    // edits details of a supervisor 
    editPerson = () => {
        axios({
            method: 'PUT',
            url: '/api/staff/supervisor',
            data: this.state.supervisor
        }).then((response) => {
            swal('Success!', `${this.state.supervisor.first_name} ${this.state.supervisor.last_name} edited`, 'success');
            this.props.dispatch({ type: PEOPLE_ACTIONS.FETCH_SUPERVISORS });
            this.props.history.push('/dashboard');
        }).catch((error) => {
            swal('Warning', `Something went wrong editing ${this.state.supervisor.first_name} ${this.state.supervisor.last_name}. Please try again in a few minutes`);
            console.log('Cannot update supervisor', error);
        })
    }//end editPerson

    //sets the state of the input fields based on user changes 
    handleChangefor = (event, property) => {
        this.setState({
            supervisor: {
                ...this.state.supervisor,
                [property]: event.target.value
            }
        })
    }//end handleChangeFor
    render() {
        return (
            <div className="padding-bottom">
                <AppBar />
                <div className="edit-person-form">
                    <h1>Edit Supervisor</h1>
                    <FormControl style={styles.formControl}>
                        <FormLabel>First Name</FormLabel>
                        <Input label="First Name" type="text" value={this.state.supervisor.first_name} onChange={(event) => this.handleChangefor(event, 'first_name')} />
                    </FormControl>
                    <FormControl style={styles.formControl}>
                        <FormLabel>Last Name</FormLabel>
                        <Input type="text" value={this.state.supervisor.last_name} onChange={(event) => this.handleChangefor(event, 'last_name')} />
                    </FormControl>
                    <FormControl style={styles.formControl}>
                        <FormLabel>Employee ID</FormLabel>
                        <Input type="text" value={this.state.supervisor.employeeId} onChange={(event) => this.handleChangefor(event, 'employeeId')} />
                    </FormControl>
                    <FormControl style={styles.formControl}>
                        <FormLabel>Email Address</FormLabel>
                        <Input type="text" value={this.state.supervisor.email_address} onChange={(event) => this.handleChangefor(event, 'email_address')} />
                    </FormControl>
                    <FormControl style={styles.formControl}>
                        <FormLabel>Username</FormLabel>
                        <Input type="text" value={this.state.supervisor.username} onChange={(event) => this.handleChangefor(event, 'username')} />
                    </FormControl>
                    <br />
                    <FormControl style={styles.formControl}>
                        <Button variant="contained" color="primary" onClick={this.editPerson}>Save</Button>
                        <Button onClick={() => this.props.history.push('/dashboard')}>Cancel</Button>
                </FormControl>
            </div>
        </div >
        );
    }
}
export default connect()(EditSupervisor); 