import React, {Component} from 'react';
import axios from 'axios'; 
import {FormControl, FormLabel, Input, Button, Checkbox, NativeSelect} from '@material-ui/core';
import './editperson.css';
import {connect} from 'react-redux';
import { PEOPLE_ACTIONS } from '../../redux/actions/peopleActions';
import AppBar from './EditPersonAppBar/EditEmployeeAppBar'; 

const mapStateToProps = state => ({
    user: state.user,
    supervisors: state.people.staff.supervisors
  });
class EditEmployee extends Component {
    constructor(props){
        super(props);
        this.state = {
            employee: {},
        }
    }
    componentDidMount = () => {
        const { match: { params } } = this.props;
        axios.get(`/api/staff/employee/profile?id=${params.personId}`)
          .then((response)=> {
            this.setState({ 
                employee: response.data[0]
            });
            this.props.dispatch({type: PEOPLE_ACTIONS.FETCH_SUPERVISORS})
          }).catch((error)=> {
              console.log('Error getting employee', error); 
          });
    }
    //if an employee is removed, they will be marked inactive in the database. 
    // only active employees should render in employee lists. 
    editPerson = () => {
            console.log('editing person');
            this.props.dispatch({type: 'UPDATE_EMPLOYEE', payload: this.state});
          }
    handleChangefor = (property, event) => {
            this.setState({
                employee:{
                    [property]: event.target.value
                }
            })
        }
    handleCheck = () => {
          this.setState({
              inactive: true
          })
      }
    render(){
        return(
            <div>
            <AppBar/>
                <div className="edit-person-form">
                <h1>Edit Employee</h1>
                <FormControl>
                    <FormLabel>First Name</FormLabel>
                    <Input type="text" value={this.state.employee.first_name} onChange={(event)=>this.handleChangefor('first_name', event)}/>
                    <FormLabel>Last Name</FormLabel>
                    <Input type="text" value={this.state.employee.last_name} onChange={(event)=>this.handleChangefor('last_name', event)}/>
                    <FormLabel>Employee ID</FormLabel>
                    <Input type="text" value={this.state.employee.employeeId} onChange={(event)=>this.handleChangefor('employee_ID', event)}/>
                    <FormLabel>Image</FormLabel>
                    <Input type="text" value={this.state.employee.image_path} onChange={(event)=>this.handleChangefor('image_path', event)}/>
                    <FormLabel>Reassign Supervisor</FormLabel>
                    <NativeSelect
                        value={this.state.employee.supervisor_id}
                        onChange={(event)=>this.handleChangeFor('supervisor_id', event)}>
                      {this.props.supervisors.map((supervisor, i) => {
                          return (
                              <option key={i} value={supervisor.supervisor_id}>{supervisor.first_name} {supervisor.last_name}</option>
                          );
                      })}
                    </NativeSelect>
                    <FormLabel>Remove?
                    <Checkbox
                    checked={this.state.employee.inactive}
                    onChange={this.handleCheck}
                    value={this.state.employee.inactive}/></FormLabel>
                    <Button onClick={this.editPerson} variant="contained" color="primary">Save</Button>
                    <Button onClick={()=>this.props.history.push('/dashboard')}>Cancel</Button>
                </FormControl>
            </div>
        </div>
        );
    }
}
export default connect(mapStateToProps)(EditEmployee); 