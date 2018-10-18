import { combineReducers } from 'redux';
import { FEEDBACK_ACTIONS } from '../actions/feedbackActions'; 

const feedbackTypes = {
    currentEmployee: [],
    allFeedbackBySupervisor: [],
}

const feedback = (state = feedbackTypes, action) => {
   if (action.type === FEEDBACK_ACTIONS.SET_CURRENT_EMPLOYEE_FEEDBACK) {
        return {...state, currentEmployee: action.payload};     
    }  else if (action.type === FEEDBACK_ACTIONS.SET_ALL_FEEDBACK_BY_CURRENT_SUPERVISOR){
        return {...state, allFeedbackBySupervisor: action.payload}; 
     } return state; 
}

// this is an object representing a row of feedback just added to the database
// if this contains an object, the feedback form view should redirect to the
// confirmation page and show the newly posted feedback
// when the user acknowledges the confirmation by clicking "Okay" on the feedback confirmation view,
// this object is cleared, as the user should be redirected to their main dashboard view
const newPostedFeedback = (state = null, action) => {
    if (action.type === FEEDBACK_ACTIONS.FEEDBACK_POST_SUCCESS) {
      return action.payload;
    } else if (action.type == FEEDBACK_ACTIONS.FEEDBACK_CONFIRMATION_ACKWNOLEDGED) {
      return null;
    } else {
      return state;
    }
};

const confirmationDisplayed = (state = false, action) => {
    if (action.type === FEEDBACK_ACTIONS.DISPLAY_FEEDBACK_CONFIRMATION) {
        return true;
    } else if (action.type === FEEDBACK_ACTIONS.FEEDBACK_CONFIRMATION_ACKWNOLEDGED) {
        return false;
    } else {
        return state;
    }
};

export default combineReducers({
   feedback,
   newPostedFeedback,
   confirmationDisplayed,
  });