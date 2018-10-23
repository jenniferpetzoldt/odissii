const initialState = {
    column: '',
    direction: ''
}

const sortReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_COLUMN_TO_SORT':
            return { ...state, column: action.payload };
        case 'ADD_SORT_DIRECTION':
            return { ...state, direction: action.payload };
        default:
            return state;
    }
};

export default sortReducer;