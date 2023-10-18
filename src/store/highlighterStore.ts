import { configureStore } from '@reduxjs/toolkit';
import highlighterReducer from './highlightSlice';

const store = configureStore({
    reducer: {
        highlighter: highlighterReducer,
    },
});

export default store;