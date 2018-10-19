import { call, put, takeLatest } from 'redux-saga/effects';
import { FEEDBACK_ACTIONS } from '../actions/feedbackActions';
import axios from 'axios';

// fetch all feedback pertaining to a specific employee
function* fetchCurrentEmployeeFeedback(action){
    try {
        const feedbackResponse = yield call(axios.get, `/api/feedback/employee?id=${action.payload}`);
        console.log('in fetchCurrentEmployeeFeedback');
        const responseAction = {type: FEEDBACK_ACTIONS.SET_CURRENT_EMPLOYEE_FEEDBACK, payload: feedbackResponse.data};
        yield put(responseAction);
    } catch(error){
        console.log('Cannot get employee feedback', error);
    }
}
// fetch all feedback created by a specific supervisor
function* fetchAllFeedbackByCurrentSupervisor(){
    try {
        const feedbackResponse = yield call(axios.get, '/api/feedback/');
        const responseAction = {type: FEEDBACK_ACTIONS.SET_ALL_FEEDBACK_BY_CURRENT_SUPERVISOR, payload: feedbackResponse.data};
        yield put(responseAction);
    } catch(error){
        console.log('Cannot get all feedback that manager has given', error);
    }
}
// fetches all feedback created by all supervisors which a manager monitors
function* fetchAllFeedbackByManagerSupervisors(){
  try{
      const feedbackResponse = yield call(axios.get, '/api/feedback/supervisors/all');
      const responseAction = {type: FEEDBACK_ACTIONS.SET_ALL_FEEDBACK_BY_MANAGER_SUPERVISORS, payload: feedbackResponse.data};
      yield put(responseAction);
  } catch(error){
      console.log('Cannot get all feedback for all managers', error);
  }
}
// adds a new feedback record
function* addFeedback(action){
  console.log('addFeedback saga called:', action);
  try{
    const postResponse = yield call(axios.post, '/api/feedback/', action.payload);
    const postedFeedback = postResponse.data;
    console.log('just posted feedback:', postedFeedback);
    yield put({
      type: FEEDBACK_ACTIONS.FEEDBACK_POST_SUCCESS,
      payload: postedFeedback
    });
    //    yield put({type: FEEDBACK_ACTIONS.FETCH_ALL_FEEDBACK_BY_CURRENT_SUPERVISOR}); 
  } catch(error){
    console.log('Cannot add new feedback', error);
  }
}
// updates feedback record
function* updateFeedback(action){
    try{
        yield call(axios.put, '/api/feedback/', action.payload);
        yield put({ type: FEEDBACK_ACTIONS.FETCH_ALL_FEEDBACK_BY_CURRENT_SUPERVISOR });
    } catch (error) {
        console.log('Cannot edit feedback', error);
    }
}
function* feedbackSaga(){
    yield takeLatest(FEEDBACK_ACTIONS.FETCH_CURRENT_EMPLOYEE_FEEDBACK, fetchCurrentEmployeeFeedback);
    yield takeLatest(FEEDBACK_ACTIONS.FETCH_ALL_FEEDBACK_BY_CURRENT_SUPERVISOR, fetchAllFeedbackByCurrentSupervisor);
    yield takeLatest(FEEDBACK_ACTIONS.FETCH_ALL_FEEDBACK_BY_MANAGER_SUPERVISORS, fetchAllFeedbackByManagerSupervisors);
    yield takeLatest(FEEDBACK_ACTIONS.ADD_FEEDBACK, addFeedback);
    yield takeLatest(FEEDBACK_ACTIONS.UPDATE_FEEDBACK, updateFeedback);
}

export default feedbackSaga;