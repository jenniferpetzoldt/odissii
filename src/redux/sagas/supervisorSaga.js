import { call, put, takeLatest } from 'redux-saga/effects';
import { PEOPLE_ACTIONS } from '../actions/peopleActions';
import axios from 'axios'; 
// will be called to fetch all supervisors 
function* fetchSupervisors(){
    try{
        const supervisorResponse = yield call(axios.get, '/api/staff/supervisors');
        const responseAction = {type: PEOPLE_ACTIONS.SET_SUPERVISORS, payload: supervisorResponse.data};
        yield put(responseAction);
    } catch(error){
        console.log('Cannot get supervisors', error); 
    }
}

//will be called to add a new supervisor & then it'll fetch all the supervisors
function* addSupervisor(action){
    try {
        yield call(axios.post, '/api/staff/supervisor', action.payload);
        yield put({type: PEOPLE_ACTIONS.FETCH_SUPERVISORS});
    } catch(error){
        console.log('Cannot add new supervisor', error);  
    }
}

//will be called to updated a supervisor & then it'll fetch all the supervisors
function* updateSupervisor(action){
    try {
        yield call(axios.put, '/api/staff/supervisor', action.payload);
        yield put({type: PEOPLE_ACTIONS.FETCH_SUPERVISORS});
    } catch(error){
        console.log('Cannot update supervisor', error);
    }
}

//will be called to delete a supervisor & then it'll fetch all the supervisors
function* deleteSupervisor(action){
    try {
        yield call(axios.delete, `/api/staff/supervisor?id=${action.payload}`);
        yield put({type: PEOPLE_ACTIONS.FETCH_SUPERVISORS});
    } catch(error){
        console.log('Cannot delete supervisor', error);
    }
}

function* supervisorSaga(){
    yield takeLatest(PEOPLE_ACTIONS.FETCH_SUPERVISORS, fetchSupervisors);
    yield takeLatest(PEOPLE_ACTIONS.ADD_SUPERVISOR, addSupervisor);
    yield takeLatest(PEOPLE_ACTIONS.UPDATE_SUPERVISOR, updateSupervisor);
    yield takeLatest(PEOPLE_ACTIONS.DELETE_SUPERVISOR, deleteSupervisor);
}
export default supervisorSaga; 