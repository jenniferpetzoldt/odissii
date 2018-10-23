const navReducer = (state = '', action) => {
    switch (action.type) {
        case 'ADD_NAV_VALUE':
            return action.payload;
        default:
            return state;
    }
};

export default navReducer;