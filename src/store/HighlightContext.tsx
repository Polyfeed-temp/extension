import React, {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";
import Highlighter from "web-highlighter";
import HighlightSource from "web-highlighter/dist/model/source";

interface State {
  highlighterLib: Highlighter | null;
  records: any[];
  isHighlighting: boolean;
  editing: HighlightSource | null;
}

interface Action {
  type: "ADD_RECORD" | "SET_EDITING" | "SET_IS_HIGHLIGHTING" | "DELETE_RECORD";
  payload: any;
}

const initialState: State = {
  highlighterLib: new Highlighter({exceptSelectors: ["#react-root"]}),
  records: [],
  editing: null,
  isHighlighting: false,
};

const HighlighterContext = createContext<
  {state: State; dispatch: React.Dispatch<Action>} | undefined
>(undefined);

const highlighterReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_RECORD":
      return {...state, records: [...state.records, action.payload]};
    case "SET_EDITING":
      return {...state, editing: action.payload};
    case "SET_IS_HIGHLIGHTING":
      action.payload
        ? state.highlighterLib?.run()
        : state.highlighterLib?.stop();
      return {...state, isHighlighting: action.payload};
    case "DELETE_RECORD":
      const newRecords = state.records.filter(
        (record) => record.id !== action.payload.id
      );
      return {...state, records: newRecords};
    default:
      return state;
  }
};

export const HighlighterProvider = ({children}: {children: ReactNode}) => {
  const [state, dispatch] = useReducer(highlighterReducer, initialState);
  // In your component
  //   useEffect(() => {
  //     const fetchData = async () => {
  //       dispatch({type: "FETCH_DATA_START"});

  //       try {
  //         const response = await fetch("https://api.example.com/data");
  //         const data = await response.json();
  //         dispatch({type: "FETCH_DATA_SUCCESS", payload: data});
  //       } catch (error) {
  //         dispatch({type: "FETCH_DATA_FAILURE", payload: error});
  //       }
  //     };

  //     fetchData();
  //   }, []); // Assuming you want to fetch the data when the component mounts.
  useEffect(() => {
    const handleCreate = (data: {sources: HighlightSource[]}) => {
      console.log(data);
      const id = data.sources[0].id;
      const text = data.sources[0].text;
      dispatch({type: "ADD_RECORD", payload: data.sources[0]});
      dispatch({type: "SET_EDITING", payload: data.sources[0]});
    };

    const handleClick = (data: {id: string}) => {
      const currentSelected = state.records.find(
        (record) => record.id === data.id
      );

      dispatch({type: "SET_EDITING", payload: currentSelected});
    };

    const handleHover = (data: {id: string}) => {
      const id = data.id;
      state.highlighterLib?.addClass("hover", id);
    };

    state.highlighterLib?.on(Highlighter.event.CREATE, handleCreate);
    state.highlighterLib?.on(Highlighter.event.CLICK, handleClick);
    state.highlighterLib?.on(Highlighter.event.HOVER, handleHover);

    // Cleanup function to remove the listeners
    return () => {
      state.highlighterLib?.off(Highlighter.event.CREATE, handleCreate);
      state.highlighterLib?.off(Highlighter.event.CLICK, handleClick);
      state.highlighterLib?.off(Highlighter.event.HOVER, handleHover);
    };
  }, [state.highlighterLib, state.records]); // the dependencies ensure that the effect runs again if either the highlighterLib or records change

  return (
    <HighlighterContext.Provider value={{state, dispatch}}>
      {children}
    </HighlighterContext.Provider>
  );
};

export const useHighlighterState = () => {
  const context = useContext(HighlighterContext);
  if (!context) {
    throw new Error(
      "useHighlighterState must be used within a HighlighterProvider"
    );
  }
  return context.state;
};

export const useHighlighterDispatch = () => {
  const context = useContext(HighlighterContext);
  if (!context) {
    throw new Error(
      "useHighlighterDispatch must be used within a HighlighterProvider"
    );
  }
  return context.dispatch;
};
