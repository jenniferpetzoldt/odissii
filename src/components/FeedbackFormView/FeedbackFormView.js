import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import {
  Grid, FormControl, FormLabel, NativeSelect, InputLabel, Input, FormControlLabel,
  RadioGroup, Radio, FormGroup, Switch, TextField, Checkbox, Button
} from '@material-ui/core';
import CloudUpload from '@material-ui/icons/CloudUpload';

// import Nav from '../Nav/Nav';
import FeedbackFormAppBar from './FeedbackFormAppBar';

import { USER_ACTIONS } from '../../redux/actions/userActions';
import { PEOPLE_ACTIONS } from '../../redux/actions/peopleActions';
import { FEEDBACK_ACTIONS } from '../../redux/actions/feedbackActions';
import { FOLLOW_UP_ACTIONS } from '../../redux/actions/followupActions';
import { QUALITY_ACTIONS } from '../../redux/actions/qualityActions';
import { USER_ROLES } from '../../constants';

const styles = {
  grid: {
    margin : 15,
  },
  form: { 
    maxWidth: '350px', 
    margin: '0 auto', 
    padding: '20px', 
    textAlign: 'center',
  }
};

const mapStateToProps = state => ({
  user: state.user,
  quality_types: state.quality_types,
  employees: state.people.staff.supervisorEmployees,
  newPostedFeedback: state.feedback.newPostedFeedback,
  newPostedFollowup: state.followup.newPostedFollowup,
});

const booleanFields = ['taskRelated', 'cultureRelated', 'followUpNeeded'];
let image = '';
class FeedbackFormView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      employeeId: '',
      quality_id: null,
      taskRelated: false,
      cultureRelated: false,
      followUpNeeded: false,
      followUpDate: '',
      details: '',
      image_path: '',
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
    if (!this.props.quality_types.length) {
      this.props.dispatch({ type: QUALITY_ACTIONS.FETCH_FEEDBACK_QUALITY_CATEGORIES });
    }
    this.config = {
      cloud_name: 'dnjpvylxb',
      upload_preset: 'ijxdygxf',
    }
  }

  componentDidUpdate() {
    const { user, employees, newPostedFeedback, newPostedFollowup, dispatch, history } = this.props;

    if (!user.isLoading && user.userName === null) {
      history.push('/home');
    } else if (!user.isLoading && user.userName && user.role !== USER_ROLES.SUPERVISOR) {
      history.push('/dashboard');
    } else if (!user.isLoading && user.userName && user.role === USER_ROLES.SUPERVISOR) {
      if (!employees.length) {
        this.getEmployees();
      }
    }

    if (newPostedFeedback) {
      if (this.state.followUpNeeded) {
        if (newPostedFollowup) {
          dispatch({ type: FEEDBACK_ACTIONS.DISPLAY_FEEDBACK_CONFIRMATION });
          history.push('/feedback/confirmation');
        }
      } else {
        dispatch({ type: FEEDBACK_ACTIONS.DISPLAY_FEEDBACK_CONFIRMATION });
        history.push('/feedback/confirmation');
      }
    }
  }

  getEmployees = () => {
    const { user, dispatch } = this.props;
    axios.get(`/api/staff/employees/${user.id}`)
      .then((response) => {
        const employees = response.data;
        dispatch({ type: PEOPLE_ACTIONS.SET_SUPERVISOR_EMPLOYEES, payload: employees });
      }).catch((error) => {
        console.log('Supervisor Employee List get error', error);
        alert('Unable to GET supervisor employees');
      })
  };

  handleInputChange = formField => event => {
    // if the form field is for a boolean value...
    if (booleanFields.includes(formField)) {
      //...toggle that value
      this.setState(prevState => ({
        [formField]: !prevState[formField]
      }));
    } else {
      this.setState({
        [formField]: event.target.value
      });
    }
  };

  handleFormSubmit = event => {
    event.preventDefault();
    const { employeeId, quality_id, taskRelated, cultureRelated, followUpNeeded, followUpDate, details, image_path } = this.state;
    const supervisorId = this.props.user.id;
    const email = this.props.user.email_address;

    const employeeHasPendingFollowUp = this.props.employees.find(employee => Number(employee.id) === Number(employeeId)).incomplete;

    const data = {
      supervisorId,
      employeeId,
      dateCreated: new Date(),
      quality_id,
      taskRelated,
      cultureRelated,
      details,
      email,
      image_path,
    };

    this.props.dispatch({
      type: FEEDBACK_ACTIONS.ADD_FEEDBACK,
      payload: data
    });


    if (employeeHasPendingFollowUp) {
      axios.put(`/api/followup/complete/${employeeId}`)
        .then(() => {
          if (followUpNeeded) {
            this.props.dispatch({
              type: FOLLOW_UP_ACTIONS.ADD_FOLLOWUP,
              payload: {
                employeeId,
                followUpDate
              }
            });
          }
        }).catch(error => {
          console.log(`/api/followup/complete/${employeeId} PUT error:`, error);
        });
    } else if (followUpNeeded) {
      this.props.dispatch({
        type: FOLLOW_UP_ACTIONS.ADD_FOLLOWUP,
        payload: {
          employeeId,
          followUpDate
        }
      });
    }
  };

  openCloudinary = (event) => {
    event.preventDefault();
    window.cloudinary.openUploadWidget(this.config, (error, result) => {
      if (result) {
        console.log(result.info.url);
        this.setState({
          ...this.state,
          image_path: result.info.url
        });
      } else if (error) {
        console.log('Error', error);
      }
    })
    this.props.dispatch({ type: 'ADD_IMAGE', payload: image });
  }

  backToDashboard = () => {
    this.props.history.push('/dashboard');
  };

  getQualityIdByName = name => this.props.quality_types.find(type => type.name === name).id;

  render() {
    const {
      employeeId,
      quality_id,
      taskRelated,
      cultureRelated,
      details,
      followUpNeeded,
      followUpDate
    } = this.state;

    const { employees } = this.props;

    let praiseId, instructId, correctId;
    if (this.props.quality_types.length) {
      praiseId = this.getQualityIdByName('praise');
      instructId = this.getQualityIdByName('instruct');
      correctId = this.getQualityIdByName('correct');
    }

    return (
      <Grid container className="padding-bottom" style={{marginTop: 0}}>
        <Grid item xs={12}>
          <FeedbackFormAppBar />
          <form style={styles.form} onSubmit={this.handleFormSubmit}>
            <Grid item xs={12} style={{ width: '100%' }}>
              <FormControl style={{ width: '75%', marginBottom: '20px' }} required>
                <InputLabel shrink htmlFor="employeeId">Employee</InputLabel>
                <NativeSelect
                  value={employeeId}
                  onChange={this.handleInputChange('employeeId')}
                  input={<Input name="employee" id="employeeId" />}
                >
                  <option value="" disabled>Select an employee...</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {`${employee.first_name} ${employee.last_name}`}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl style={{ marginBottom: '20px' }} required>
                <FormLabel>Feedback Quality</FormLabel>
                <RadioGroup style={{display: 'flex', flexDirection: 'row'}}
                  aria-label="feedback-type"
                  name="quality_id"
                  value={quality_id}
                  onChange={this.handleInputChange('quality_id')}
                >
                  {praiseId && <FormControlLabel key={praiseId} value={praiseId.toString()} label={'Praise'} control={<Radio />} />}
                  {instructId && <FormControlLabel key={instructId} value={instructId.toString()} label={'Instruct'} control={<Radio />} />}
                  {correctId && <FormControlLabel key={correctId} value={correctId.toString()} label={'Correct'} control={<Radio />} />}
                  

                  {/* {this.props.quality_types.map(quality => (
                    <FormControlLabel key={quality.id} value={quality.id.toString()} label={quality.name} control={<Radio />} />
                  ))} */}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl style={{ marginBottom: '10px' }}>
                <FormLabel>This feedback is:</FormLabel>
                <FormGroup style={{display: 'flex', flexDirection: 'row'}}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={taskRelated}
                        onChange={this.handleInputChange('taskRelated')}
                      />
                    }
                    label="Task-Related"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cultureRelated}
                        onChange={this.handleInputChange('cultureRelated')}
                      />
                    }
                    label="Culture-Related"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField required style={{width: '75%', marginBottom: '20px' }}
                type="text"
                label="Feedback Details"
                placeholder="Add feedback details"
                value={details}
                onChange={this.handleInputChange('details')}
                multiline
                rows="3"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl>
                <FormControlLabel
                  label="Follow-Up Needed?"
                  control={
                    <Checkbox
                      checked={followUpNeeded}
                      onChange={this.handleInputChange('followUpNeeded')}
                    />
                  }
                />
              </FormControl>
            </Grid>
            {/* follow-up date picker renders if the user checks the "Follow-Up Needed? box" */}
            {followUpNeeded &&
              <Grid item xs={12}>
                <FormControl style={{ marginBottom: '20px' }}>
                  <TextField
                    type="date"
                    label="Follow-Up Date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={followUpDate}
                    onChange={this.handleInputChange('followUpDate')}
                  />
                </FormControl>
              </Grid>}
             {/* input to upload images through cloudinary */}
             <Grid item xs={12} style={styles.grid}>
                <FormControl>
                  <Button onClick={this.openCloudinary}>
                    <CloudUpload />&nbsp;Upload Image
                  </Button>
                </FormControl>
              </Grid>
            <div>
              <Button onClick={this.backToDashboard}>Cancel</Button>
              <Button type="submit" color="primary" variant="contained">Submit</Button>
            </div>
          </form>
            </Grid>
        </Grid>
        );
      }
    }
    
export default connect(mapStateToProps)(FeedbackFormView);