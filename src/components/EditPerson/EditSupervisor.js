import React, {Component} from 'react';
import axios from 'axios'; 
import {FormControl, FormLabel, Input, Button} from '@material-ui/core';
import './editperson.css';
import swal from 'sweetalert'; 
import {connect} from 'react-redux'; 
import { PEOPLE_ACTIONS } from '../../redux/actions/peopleActions';
import AppBar from './EditPersonAppBar/EditSupervisorAppBar'; 
class EditSupervisor extends Component {
    constructor(props){
        super(props);
        //these will be generated through the component did mount thing 
        this.state = {
         supervisor: {}
        }
    }
    //when the component mounts, an axios call will go out to get information about the supervisor whose ID was included in the route parameters
    componentDidMount =() => {
        const { match: { params } } = this.props;
        axios.get(`/api/staff/supervisor/profile?id=${params.personId}`)
          .then((response)=> {
            this.setState({ 
               supervisor: response.data[0]
            });
          }).catch((error)=> {
              console.log('Error getting supervisor', error); 
          });
      }; 
        editPerson = () => {
            axios({
                method: 'PUT',
                url: '/api/staff/supervisor',
                data: this.state.supervisor
            }).then((response) => {
                    swal('Success!', `${this.state.supervisor.first_name} ${this.state.supervisor.last_name} edited`, 'success');
                    this.props.dispatch({type: PEOPLE_ACTIONS.FETCH_SUPERVISORS});
                    this.props.history.push('/dashboard'); 
            }).catch((error) => {
                swal('Warning', `Something went wrong editing ${this.state.supervisor.first_name} ${this.state.supervisor.last_name}. Please try again in a few minutes`);
                console.log('Cannot update supervisor', error);
            })
            
          }
        handleChangefor = (event, property) => {
            this.setState({
                supervisor: {
                    ...this.state.supervisor, 
                    [property]: event.target.value
                }
            })
        }
    render(){
        return(
            <div>
                <AppBar/>
            <div className="edit-person-form">
            <h1>Edit Supervisor</h1>
                <FormControl>
                    <FormLabel>First Name</FormLabel>
                    <Input type="text" value={this.state.supervisor.first_name} onChange={(event)=>this.handleChangefor(event, 'first_name')}/>
                    <FormLabel>Last Name</FormLabel>
                    <Input type="text" value={this.state.supervisor.last_name} onChange={(event)=>this.handleChangefor(event, 'last_name')}/>
                    <FormLabel>Employee ID</FormLabel>
                    <Input type="text" value={this.state.supervisor.employeeId} onChange={(event)=>this.handleChangefor(event, 'employeeId')}/>
                    <FormLabel>Email Address</FormLabel>
                    <Input type="text" value={this.state.supervisor.email_address} onChange={(event)=>this.handleChangefor(event,'email_address')}/>
                    <FormLabel>Username</FormLabel>
                    <Input type="text" value={this.state.supervisor.username} onChange={(event)=>this.handleChangefor(event, 'username')}/>
                    <br/>
                    <Button variant="contained" color="primary" onClick={this.editPerson}>Save</Button>
                    <Button onClick={()=>this.props.history.push('/dashboard')}>Cancel</Button>
                </FormControl>
            </div>
        </div>
        );
    }
}
export default connect()(EditSupervisor); 