const imageReducer = (state= '', action) => {
    switch (action.type) {
        case 'ADD_IMAGE':
            return action.payload;
        default:
            return state;
    }
};

export default imageReducer;