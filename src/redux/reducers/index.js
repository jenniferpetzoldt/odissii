import { combineReducers } from 'redux';
import user from './userReducer';
import login from './loginReducer';
import people from './peopleReducer';
import feedback from './feedbackReducer';
import search from './searchReducer';
import followup from './followupReducer';
import sort from './sortReducer';
import id from './idReducer';
import quality_types from './qualityReducer';
import nav from './navReducer';
import image from './imageReducer';

//Lets make a bigger object for our store, with the objects from our reducers.
//This is why we get this.props.reduxStore.user.isLoading
const store = combineReducers({
  user,
  login,
  people,
  feedback,
  search,
  sort,
  followup,
  sort,
  id,
  quality_types,
  nav,
  image,
});

export default store;
