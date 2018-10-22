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

// feedback/detail/:feedbackId
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
      this.props.dispatch({ type:  QUALITY_ACTIONS.FETCH_FEEDBACK_QUALITY_CATEGORIES});
    }
  }

  componentDidUpdate() {
    const { user, history } = this.props;

    if (!user.isLoading && user.userName === null) {
      history.push('/home');
    } else if (!user.isLoading && user.userName) {
      if (!this.state.originalFeedback) {
        axios.get(`/api/feedback/detail/${this.props.match.params.feedbackId}`)
        .then(response => {
          const data = response.data;
          if (data.follow_up_date) {
            data.follow_up_date = moment(data.follow_up_date).format('YYYY-MM-DD');
            data.follow_up_needed = true;
          } else {
            data.follow_up_date = '';
          }
          this.setState({
            originalFeedback: data,
            formFields: {...data}
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
      formFields: {...this.state.originalFeedback}
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    const editedFeedback = {...this.state.formFields, date_edited: new Date()};
    axios.put('/api/feedback', editedFeedback)
    .then(response => {
      if (!editedFeedback.follow_up_needed) {
        editedFeedback.follow_up_date = '';
      }
      this.setState({
        originalFeedback: {...editedFeedback},
        formFields: {...editedFeedback}
      });
    }).catch(error => {
      console.log('/api/feedback PUT error:', error);
    });
  };

  backToPreviousPage = () => {
    this.props.history.push('/employees');
  };

  render() {
    const { originalFeedback, formFields } = this.state;
    const { quality_types } = this.props;
    let content = null;
    if (!originalFeedback || !quality_types) return null;

    const editingCutoffTime = moment(originalFeedback.date_created).add(72, 'hours');
    const editingAllowed = moment().isBefore(editingCutoffTime);

    if (editingAllowed) {
      content = (
        <form onSubmit={this.handleFormSubmit} style={{marginTop: '20px'}}>
          <FormControl required>
            <FormLabel>Feedback Quality</FormLabel>
            <RadioGroup
              aria-label="feedback-type"
              name="quality_id"
              value={formFields.quality_id.toString()}
              onChange={this.handleInputChange('quality_id')}
            >
              {this.props.quality_types.map(quality => (
                <FormControlLabel key={quality.id} value={quality.id.toString()} label={quality.name} control={<Radio />}/>
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
          {!_.isEqual(originalFeedback, formFields) && 
            <div>
              <Button onClick={this.abandonChanges}>Cancel</Button>
              <Button type="submit" color="primary" variant="contained">Save</Button>
            </div>
          }
        </form>
      );
    } else {
      content = (
        <div>
          <Typography variant="subtitle2" className="center">
            Feedback Quality
          </Typography>
          <Typography variant="h6" className="center">
            {quality_types.length && this.getQualityName(originalFeedback.quality_id)}
          </Typography>
          <Typography variant="h6" className="center">
            {originalFeedback.task_related && 'Task-Related'}
            {originalFeedback.culture_related && 'Culture-Related'}
          </Typography>
          <Typography variant="h6" className="center">
            {originalFeedback.culture_related && 'Culture-Related'}
          </Typography>
          <Typography variant="subtitle2" className="center">
            Details
          </Typography>
          <Typography variant="body1" className="center">
            {originalFeedback.details}
          </Typography>
        </div>



        // <div>
        //   <ul>
        //     <li>Feedback quality: {this.getQualityName(originalFeedback.quality_id)}</li>
        //     <li>Task-Related: {JSON.stringify(originalFeedback.task_related)}</li>
        //     <li>Culture-Related: {JSON.stringify(originalFeedback.culture_related)}</li>
        //     <li>Details: {originalFeedback.details}</li>
        //     {/* {originalFeedback.follow_up_date && <li></li>} */}
        //   </ul>
          
        // </div>
      );
    }

    return (
      <Grid container justify="center">
        <AppBar position="sticky">
          <Toolbar>
            <IconButton onClick={this.backToPreviousPage}><ArrowBack /></IconButton>
            <Typography>Feedback Detail</Typography>
          </Toolbar>
        </AppBar>
        <Grid item xs={12}>
          <Typography variant="h4" className="center">
            {`${originalFeedback.first_name} ${originalFeedback.last_name}`}
          </Typography>
          <Typography variant="subtitle2" className="center">
            Feedback created on
          </Typography>
          <Typography variant="h6" className="center">
            {moment(originalFeedback.date_created).format("dddd, MMMM Do YYYY")}
          </Typography>
          {originalFeedback.date_edited &&
            <div>
              <Typography variant="subtitle2" className="center">
                Last edited on
              </Typography>
              <Typography variant="h6" className="center">
                {moment(originalFeedback.date_edited).format("dddd, MMMM Do YYYY")}
              </Typography>
            </div>
          }
          {content}
        </Grid>
      </Grid>
    );
  }
}

export default connect(mapStateToProps)(FeedbackDetailView);