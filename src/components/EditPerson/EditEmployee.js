import React, {Component} from 'react';
import axios from 'axios'; 
import {FormControl, FormLabel, TextField, Button, Checkbox, NativeSelect} from '@material-ui/core';
import './editperson.css';
import {connect} from 'react-redux';
import { PEOPLE_ACTIONS } from '../../redux/actions/peopleActions';
import AppBar from './EditPersonAppBar/EditEmployeeAppBar'; 

const mapStateToProps = state => ({
    user: state.user,
    supervisors: state.people.staff.supervisors
  });
  const styles = {
    formControl: {
        marginRight: 20,
        padding: 10,
        margin: 5
    },
}

class EditEmployee extends Component {
    constructor(props){
        super(props);
        this.state = {
            employee: {
                first_name: '',
                last_name: '',
                employeeId: '',
                image_path: '', 
                supervisor_id: ''
            },
        }
    }
    componentDidMount = () => {
        this.getEmployee();
    }
    //if an employee is removed, they will be marked inactive in the database. 
    // only active employees should render in employee lists. 
    editPerson = () => {
            console.log('editing person');
            this.props.dispatch({type: 'UPDATE_EMPLOYEE', payload: this.state.employee});
          }
    getEmployee = () => {
        const { match: { params } } = this.props;
        axios.get(`/api/staff/employee/profile?id=${params.personId}`)
          .then((response)=> {
              console.log(response.data[0]);
            this.setState({ 
                employee: response.data[0]
            });
            this.props.dispatch({type: PEOPLE_ACTIONS.FETCH_SUPERVISORS})
          }).catch((error)=> {
              console.log('Error getting employee', error); 
          });
    }
    handleChangeFor = (property, event) => {
            this.setState({
                employee:{
                    ...this.state.employee,
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
                <FormControl style={styles.formControl}>
                    <TextField label="First Name" value={this.state.employee.first_name} onChange={(event)=>this.handleChangeFor('first_name', event)}/>
                </FormControl>
                <FormControl style={styles.formControl}>
                    <TextField label="Last Name" value={this.state.employee.last_name} onChange={(event)=>this.handleChangeFor('last_name', event)}/>
                </FormControl>
                <FormControl style={styles.formControl}>
                    <TextField label="Employee ID" value={this.state.employee.employeeId} onChange={(event)=>this.handleChangeFor('employeeId', event)}/>
                </FormControl>
                <FormControl style={styles.formControl}>
                    <TextField label="Image Path" value={this.state.employee.image_path} onChange={(event)=>this.handleChangeFor('image_path', event)}/>
                </FormControl>
                <FormControl style={styles.formControl}>
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
                </FormControl>
                <FormControl>
                    <FormLabel>Remove?
                    <Checkbox
                    checked={this.state.employee.inactive}
                    onChange={this.handleCheck}
                    value={this.state.employee.inactive}/></FormLabel>
                </FormControl>
                <br/>
                    <Button onClick={this.editPerson} variant="contained" color="primary">Save</Button>
                    <Button onClick={()=>this.props.history.push('/dashboard')}>Cancel</Button>
                </div>
        </div>
        );
    }
}
export default connect(mapStateToProps)(EditEmployee); 