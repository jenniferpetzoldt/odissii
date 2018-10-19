import { combineReducers } from 'redux';
import { PEOPLE_ACTIONS } from '../actions/peopleActions';

const peopleType = {
    supervisors: [],
    supervisorEmployees: [],
    allEmployees: [],
    supervisorToView: ''
}

const staff = (state = peopleType, action) => {
    if (action.type === PEOPLE_ACTIONS.SET_SUPERVISORS) {
        return {...state, supervisors: action.payload};
    } else if (action.type === PEOPLE_ACTIONS.SET_SUPERVISOR_EMPLOYEES) {
        return {...state, supervisorEmployees: action.payload};
    } else if (action.type === PEOPLE_ACTIONS.SET_ALL_EMPLOYEES) {
        return {...state, allEmployees: action.payload}
    } else if (action.type === 'SET_SUPERVISOR_TO_VIEW'){
        return {...state, supervisorToView: action.payload}
    }
    return state;
};

export default combineReducers({
    staff,
});