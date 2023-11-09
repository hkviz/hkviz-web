type RunFileStoreValue = Record<
    string,
    {
        finishedLoading: boolean;
    }
>;

const initialState: RunFileStoreValue = { value: 0 };

function runFileReducer(state = initialState, action) {
    switch (action.type) {
        case 'increment':
            return { ...state, value: state.value + 1 };
        case 'decrement':
            return { ...state, value: state.value - 1 };
        case 'incrementByAmount':
            return { ...state, value: state.value + action.payload };
        default:
            return state;
    }
}
