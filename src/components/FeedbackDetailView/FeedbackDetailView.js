import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

import { USER_ACTIONS } from '../../redux/actions/userActions';
import { QUALITY_ACTIONS } from '../../redux/actions/qualityActions';

import {
  Grid, AppBar, Toolbar, IconButton, FormControl, FormLabel,
  FormControlLabel, RadioGroup, Radio, FormGroup, Switch, TextField,
  Checkbox, Button, Typography
} from '@material-ui/core';

import { ArrowBack } from '@material-ui/icons';

const booleanFields = ['task_related', 'culture_related', 'follow_up_needed'];

const mapStateToProps = state => ({
  user: state.user,
  quality_types: state.quality_types,
});

// url path - feedback/detail/:feedbackId

/* This component displays the details of an entry of feedback already given */
class FeedbackDetailView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      originalFeedback: null,
      formFields: null,
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
    if (!this.props.quality_types.length) {
      this.props.dispatch({ type: QUALITY_ACTIONS.FETCH_FEEDBACK_QUALITY_CATEGORIES });
    }
  }

  componentDidUpdate() {
    const { user, history } = this.props;

    if (!user.isLoading && user.userName === null) {
      history.push('/home');
    } else if (!user.isLoading && user.userName) {
      // if the user is loaded but the feedback has not been loaded, fetch the feedback
      if (!this.state.originalFeedback) {
        axios.get(`/api/feedback/detail/${this.props.match.params.feedbackId}`)
          .then(response => {
            const data = response.data;
            // if the feedback has a follow up date, convert it to a format to display on the screen
            // set the boolean "follow_up_needed" to true so that we can display the follow up date on the screen
            if (data.follow_up_date) {
              data.follow_up_date = moment(data.follow_up_date).format('YYYY-MM-DD');
              data.follow_up_needed = true;
            } else {
              data.follow_up_date = '';
            }
            this.setState({
              originalFeedback: data,
              formFields: { ...data }
            });
          }).catch(error => {
            console.log(`/api/feedback/detail/${this.props.match.params.feedbackId} GET request error:`, error);
          });
      }
    }
  }

  getQualityName = qualityId => this.props.quality_types.find(type => type.id === qualityId).name;

  handleInputChange = fieldName => event => {
    if (booleanFields.includes(fieldName)) {
      this.setState({
        formFields: {
          ...this.state.formFields,
          [fieldName]: !this.state.formFields[fieldName]
        }
      });
    } else {
      this.setState({
        formFields: {
          ...this.state.formFields,
          [fieldName]: String(event.target.value)
        }
      });
    }
    console.log(fieldName, event.target.value);
  };

  abandonChanges = () => {
    this.setState({
      formFields: { ...this.state.originalFeedback }
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    const editedFeedback = { ...this.state.formFields, date_edited: new Date() };
    axios.put('/api/feedback', editedFeedback)
      .then(response => {
        if (!editedFeedback.follow_up_needed) {
          editedFeedback.follow_up_date = '';
        }
        this.setState({
          originalFeedback: { ...editedFeedback },
          formFields: { ...editedFeedback }
        });
      }).catch(error => {
        console.log('/api/feedback PUT error:', error);
      });
  };

  backToPreviousPage = () => {
    this.props.history.push('/individualEmployee');
  };

  render() {
    const { originalFeedback, formFields } = this.state;
    const { quality_types } = this.props;
    let content = null;
    if (!originalFeedback || !quality_types) return null;

    const editingCutoffTime = moment(originalFeedback.date_created).add(72, 'hours');
    const editingAllowed = moment().isBefore(editingCutoffTime);

    /*
    if the feedback was created less than 72 hours ago, show the feedback content
    within an editable form, which the user can use to edit the feedback and resave it.
    Otherwise, show the feedback details as text for viewing only.
    */
    if (editingAllowed) {
      // the content if the user is allowed to edit the feedback
      content = (
        <form onSubmit={this.handleFormSubmit} style={{ marginTop: '20px' }}>
          <FormControl required>
            <FormLabel>Feedback Quality</FormLabel>
            <RadioGroup
              aria-label="feedback-type"
              name="quality_id"
              value={formFields.quality_id.toString()}
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
                    checked={formFields.task_related}
                    onChange={this.handleInputChange('task_related')}
                  />
                }
                label="Task-Related"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formFields.culture_related}
                    onChange={this.handleInputChange('culture_related')}
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
                  checked={formFields.follow_up_needed}
                  onChange={this.handleInputChange('follow_up_needed')}
                />
              }
            />
          </FormControl>
          {formFields.follow_up_needed &&
            <FormControl>
              <TextField
                type="date"
                label="Follow-Up Date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={formFields.follow_up_date}
                onChange={this.handleInputChange('follow_up_date')}
              />
            </FormControl>}
          <TextField required
            label="Feedback Details"
            placeholder="Add feedback details"
            value={formFields.details}
            onChange={this.handleInputChange('details')}
            multiline
          />
          {/* the Save/Cancel buttons only show if the feedback has been changed */}
          {!_.isEqual(originalFeedback, formFields) &&
            <div>
              <Button onClick={this.abandonChanges}>Cancel</Button>
              <Button type="submit" color="primary" variant="contained">Save</Button>
            </div>
          }
        </form>
      );
    } else {
      // the content if the editing window has expired
      content = (
        <div>
          <Typography variant="subtitle2" className="center">
            Feedback Quality: {quality_types.length && this.getQualityName(originalFeedback.quality_id)} / {originalFeedback.task_related && 'Task-Related'}
            {originalFeedback.culture_related && 'Culture-Related'}
          </Typography>
          <Typography variant="subtitle2" className="center">
            Details: {originalFeedback.details}
          </Typography>
        </div>
      );
    }

    return (
      <Grid container justify="center">
        <AppBar position="sticky">
          <Toolbar>
            <IconButton onClick={this.backToPreviousPage}><ArrowBack style={{ color: '#f7fcff' }} /></IconButton>
            <h3 style={{ color: '#f7fcff' }}>Feedback Detail</h3>
          </Toolbar>
        </AppBar>
        <Grid item xs={12}>
          <div className="padding-top">
            <Typography variant="h4" className="center">
              {`${originalFeedback.first_name} ${originalFeedback.last_name}`}
            </Typography>
            <Typography variant="subtitle2" className="center">
              Feedback created on: {moment(originalFeedback.date_created).format("MM/DD/YY")}
            </Typography>
            {originalFeedback.date_edited &&
              <div>
                <Typography variant="subtitle2" className="center">
                  Last edited on: {moment(originalFeedback.date_edited).format("dddd, MMMM Do YYYY")}
                </Typography>
              </div>
            }
            {content}
          </div>
        </Grid>
      </Grid>
    );
  }
}

export default connect(mapStateToProps)(FeedbackDetailView);