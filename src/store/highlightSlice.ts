import { createSlice } from '@reduxjs/toolkit';
import Highlighter from "web-highlighter"

export interface HighlighterState {
    enable: boolean;
    currentID: string;
    highlighterLib: Highlighter | null;
    records: any[];
}

const highlighterLib = new Highlighter({
    exceptSelectors: ["#react-root"],
})
highlighterLib.on("selection:create", ({ sources }) => {
    console.log(sources)
    setCurrentID(sources[0].id)
    addHighlight(sources[0])




})

const initialState: HighlighterState = {
    enable: true,
    currentID: '',
    highlighterLib: highlighterLib,
    records: [],
};


const highlighter = createSlice({
    name: 'myFeature',
    initialState,
    reducers: {
        setEnable: (state, action) => {

            state.enable = action.payload;
            state.enable ? console.log("enable") : console.log("disable")
            if (state.highlighterLib) {
                if (state.enable) {
                    state.highlighterLib.run();
                } else {
                    state.highlighterLib.stop();
                }
            }
        },

        setCurrentID: (state, action) => {
            console.log(action.payload)
            state.currentID = action.payload;
        },
        setHighlighter: (state, action) => {
            state.highlighterLib = action.payload;
        },
        addHighlight: (state, action) => {
            state.records.push(action.payload);
        }

    }
});

export const { setEnable, setCurrentID, setHighlighter, addHighlight } = highlighter.actions;
export default highlighter.reducer;
