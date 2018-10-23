const idReducer = (state = '', action) => {
    switch (action.type) {
        case 'EMPLOYEE_TO_VIEW':
            return action.payload;
        default:
            return state;
    }
};

export default idReducer;