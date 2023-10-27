import React, {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";
import Highlighter from "web-highlighter";
import HighlightSource from "web-highlighter/dist/model/source";
import AnnotationService from "../services/localStorage";
import {RenderPop} from "../components/Toolbar";
import {Annotation, AnnotationTag, SideBarAction} from "../types";

interface State {
  highlighterLib: Highlighter | null;
  records: Annotation[];
  isHighlighting: boolean;
  editing: {
    sidebarAction: SideBarAction;
    annotation: Annotation;
  } | null;
  drafting: HighlightSource | null;
}
interface InitializeAction {
  type: "INITIALIZE";
  payload: Annotation[]; // Assuming you have a Record type defined somewhere.
}
interface AddRecordAction {
  type: "ADD_RECORD";
  payload: Annotation; // Assuming you have a Record type defined somewhere.
}

interface SetEditingAction {
  type: "SET_EDITING";
  payload: {sidebarAction: SideBarAction; annotation: Annotation}; // Assuming you have a HighlightSource type.
}

interface SetIsHighlightingAction {
  type: "SET_IS_HIGHLIGHTING";
  payload: boolean;
}

interface DeleteRecordAction {
  type: "DELETE_RECORD";
  payload: {
    id: string; // Or number, based on your ID type.
  };
}
interface SetDraftingAction {
  type: "SET_DRAFTING";
  payload: HighlightSource;
}

type Action =
  | AddRecordAction
  | SetEditingAction
  | SetIsHighlightingAction
  | DeleteRecordAction
  | InitializeAction
  | SetDraftingAction;

const initialState: State = {
  highlighterLib: new Highlighter({exceptSelectors: ["#react-root"]}),
  records: [],
  editing: null,
  isHighlighting: false,
  drafting: null,
};

const HighlighterContext = createContext<
  {state: State; dispatch: React.Dispatch<Action>} | undefined
>(undefined);

const highlighterReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "INITIALIZE":
      action.payload.forEach((annotation) => {
        state.highlighterLib?.fromStore(
          annotation.startMeta,
          annotation.endMeta,
          annotation.text,
          annotation.id
        );
      });

      console.log(state);
      return {...state, records: action.payload};
    case "SET_DRAFTING":
      return {...state, drafting: action.payload};
    case "ADD_RECORD":
      // const annotation = {...action.payload, annotationLabel: "Strength"} as Annotation
      return {...state, records: [...state.records, action.payload]};
    case "SET_EDITING":
      console.log(action.payload);
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
  const [state, baseDispatch] = useReducer(highlighterReducer, initialState);
  const service = new AnnotationService();
  useEffect(() => {
    const fetchAnnotations = async () => {
      const annotations = await service.getAnnotationsForUrl(
        window.location.href
      );
      baseDispatch({type: "INITIALIZE", payload: annotations});
    };
    fetchAnnotations();
  }, []);
  const dispatch = async (action: Action) => {
    switch (action.type) {
      case "ADD_RECORD":
        try {
          const sources = action.payload;
          console.log("adding", sources);
          const annotation = await service.addAnnotations(sources);
          // console.log(annotation);
          baseDispatch({type: "ADD_RECORD", payload: action.payload});
        } catch (err) {
          console.log(err);
        }
        break;
      case "DELETE_RECORD":
        try {
          const {id} = action.payload;
          await service.removeAnnotation(id);
          baseDispatch({type: "DELETE_RECORD", payload: action.payload});
        } catch (err) {
          console.log(err);
        }
        break;
      default:
        baseDispatch(action);
    }
  };
  useEffect(() => {
    const handleCreate = (data: {sources: HighlightSource[]; type: string}) => {
      const id = data.sources[0].id;
      const _node = state.highlighterLib?.getDoms(id)[0];
      if (_node) {
        _node.innerHTML =
          `<span id=${`__highlight-${id}`}></span>` + _node.innerHTML;
      }
      if (data.type === "from-store") {
        return;
      }
      dispatch({type: "SET_DRAFTING", payload: data.sources[0]});
    };

    const handleClick = (data: {id: string}) => {
      const currentSelected = state.records.find(
        (record) => record.id === data.id
      ) as Annotation;

      // dispatch({type: "SET_EDITING", payload: currentSelected});
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
      {state.drafting ? (
        <RenderPop highlighting={state.drafting}></RenderPop>
      ) : null}
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
