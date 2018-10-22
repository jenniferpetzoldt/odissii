import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import {
  Grid, FormControl, FormLabel, NativeSelect, InputLabel, Input, FormControlLabel,
  RadioGroup, Radio, FormGroup, Switch, TextField, Checkbox, Button, InputAdornment
} from '@material-ui/core';
import CloudUpload from '@material-ui/icons/CloudUpload';

import Nav from '../Nav/Nav';
import FeedbackFormAppBar from './FeedbackFormAppBar';

import { USER_ACTIONS } from '../../redux/actions/userActions';
import { PEOPLE_ACTIONS } from '../../redux/actions/peopleActions';
import { FEEDBACK_ACTIONS } from '../../redux/actions/feedbackActions';
import { FOLLOW_UP_ACTIONS } from '../../redux/actions/followupActions';
import { QUALITY_ACTIONS } from '../../redux/actions/qualityActions';
import { USER_ROLES } from '../../constants';

const mapStateToProps = state => ({
  user: state.user,
  quality_types: state.quality_types,
  employees: state.people.staff.supervisorEmployees,
  newPostedFeedback: state.feedback.newPostedFeedback,
  newPostedFollowup: state.followup.newPostedFollowup,
});

const booleanFields = ['taskRelated', 'cultureRelated', 'followUpNeeded'];

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
    const { employeeId, quality_id, taskRelated, cultureRelated, followUpNeeded, followUpDate, details } = this.state;
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
    };

    this.props.dispatch({
      type: FEEDBACK_ACTIONS.ADD_FEEDBACK,
      payload: data
    });

    this.submitImage();

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

  submitImage = () => {
    const image_path = this.state.image_path;
    const email = this.props.user.email_address;
    //need feeback id from response of feedback submit
    const data = { image_path, email }
    axios({
      method: 'POST',
      url: '/api/feedback/image',
      data: data,
    }).then((response) => {
      console.log('submitImage response', response);
    }).catch((error) => {
      console.log('submitImage error', error);
      alert('Unable to submit image');
    })
  }

  backToDashboard = () => {
    this.props.history.push('/dashboard');
  };

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

    return (
      <Grid container>
        <Grid item xs={12}>
          <FeedbackFormAppBar />
          <Nav />
          <form onSubmit={this.handleFormSubmit}>
            <FormControl required>
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
            <FormControl required>
              <FormLabel>Feedback Quality</FormLabel>
              <RadioGroup
                aria-label="feedback-type"
                name="quality_id"
                value={quality_id}
                onChange={this.handleInputChange('quality_id')}
              >
                {this.props.quality_types.map(quality => (
                  <FormControlLabel key={quality.id} value={quality.id.toString()} label={quality.name} control={<Radio />} />
                ))}
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel>This feedback is:</FormLabel>
              <FormGroup>
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
            {/* follow-up date picker renders if the user checks the "Follow-Up Needed? box" */}
            {followUpNeeded &&
              <FormControl>
                <TextField
                  type="date"
                  label="Follow-Up Date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={followUpDate}
                  onChange={this.handleInputChange('followUpDate')}
                />
              </FormControl>}
            {/* input to upload images through cloudinary */}
            <FormControl>
              <Input
                name="image_path"
                type="file"
                startAdornment={
                  <InputAdornment position="start">
                    <CloudUpload />
                  </InputAdornment>
                }
                onChange={this.handleInputChange('image_path')}
              />
            </FormControl>
            <TextField required
              label="Feedback Details"
              placeholder="Add feedback details"
              value={details}
              onChange={this.handleInputChange('details')}
              multiline
            />
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