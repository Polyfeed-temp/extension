import React, {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import Highlighter from "web-highlighter";
import HighlightSource from "web-highlighter/dist/model/source";
import AnnotationService from "../services/annotation.service";
import {RenderPop} from "../components/Toolbar";
import {
  Annotation,
  AnnotationTag,
  SideBarAction,
  AnnotationData,
  Feedback,
  getClassForTag,
} from "../types";
import Tippy from "@tippyjs/react";
import {toast} from "react-toastify";
interface HighlightState {
  highlighterLib: Highlighter | null;
  feedbackId?: number;
  records: AnnotationData[];
  isHighlighting: boolean;
  editing: {
    sidebarAction: SideBarAction;
    annotation: Annotation;
  } | null;
  drafting: HighlightSource | null;
  unlabledHighlights: HighlightSource[];
}
interface InitializeAction {
  type: "INITIALIZE";
  payload: Feedback | null;
}

interface AddFeedbackAction {
  type: "ADD_FEEDBACK";
  payload: Feedback;
}
interface AddRecordAction {
  type: "ADD_RECORD";
  payload: AnnotationData;
}

interface SetEditingAction {
  type: "SET_EDITING";
  payload: {sidebarAction: SideBarAction; annotation: Annotation};
}

interface SetIsHighlightingAction {
  type: "SET_IS_HIGHLIGHTING";
  payload: boolean;
}

interface DeleteRecordAction {
  type: "DELETE_RECORD";
  payload: string;
}
interface SetDraftingAction {
  type: "SET_DRAFTING";
  payload: HighlightSource;
}
interface SelectHighlightAction {
  type: "SELECT_HIGHLIGHT";
  payload: string;
}

interface UpdateHighlight {
  type: "UPDATE_HIGHLIGHT_NOTES";
  payload: {id: string; notes: string};
}

type Action =
  | AddRecordAction
  | SetEditingAction
  | SetIsHighlightingAction
  | DeleteRecordAction
  | InitializeAction
  | SetDraftingAction
  | AddFeedbackAction
  | SelectHighlightAction
  | UpdateHighlight;
const HighlighterContext = createContext<
  {state: HighlightState; dispatch: React.Dispatch<Action>} | undefined
>(undefined);

const highlighterReducer = (
  state: HighlightState,
  action: Action
): HighlightState => {
  switch (action.type) {
    case "INITIALIZE":
      const root = document.getElementById("docos-stream-view") as HTMLElement;
      root
        ? console.log("doco streamview")
        : console.log("not doco streamview");
      const lib = new Highlighter({
        $root: root ? root : document.documentElement,
        exceptSelectors: ["#react-root"],
      });

      const initialState: HighlightState = {
        highlighterLib: lib,
        records: action.payload?.highlights ? action.payload.highlights : [],
        editing: null,
        isHighlighting: false,
        feedbackId: action.payload?.id,
        drafting: null,
        unlabledHighlights: [],
      };

      console.log("initialize");

      return {...state, ...initialState};
    case "SET_DRAFTING":
      return {
        ...state,
        drafting: action.payload,
        unlabledHighlights: [...state.unlabledHighlights, action.payload],
      };
    case "ADD_RECORD":
      //after adding record to db, add to state and remove from current editing and drafting
      return {
        ...state,
        editing: null,
        drafting: null,
        records: [...state.records, action.payload],
      };
    case "SET_EDITING":
      return {...state, editing: action.payload};
    case "SET_IS_HIGHLIGHTING":
      action.payload
        ? state.highlighterLib?.run()
        : state.highlighterLib?.stop();
      return {...state, isHighlighting: action.payload};
    case "DELETE_RECORD":
      const newRecords = state.records.filter(
        (record) => record.annotation.id !== action.payload
      );
      state.highlighterLib?.remove(action.payload);
      return {...state, records: newRecords};
    case "ADD_FEEDBACK":
      return {...state, feedbackId: action.payload.id};
    case "SELECT_HIGHLIGHT":
      const highlight = state.records.find(
        (record) => record.annotation.id === action.payload
      );

      if (!highlight) {
        return {
          ...state,
          drafting:
            state.unlabledHighlights.find(
              (highlight) => highlight.id === action.payload
            ) || null,
        };
      }
      return {
        ...state,
        editing: {sidebarAction: "Editing", annotation: highlight.annotation},
      };

    default:
      return state;
  }
};

export const HighlighterProvider = ({children}: {children: ReactNode}) => {
  const initialState: HighlightState = {
    highlighterLib: null,
    records: [],
    editing: null,
    isHighlighting: false,
    drafting: null,
    unlabledHighlights: [],
  };

  const [state, baseDispatch] = useReducer(highlighterReducer, initialState);
  const [selectedHighlightElement, setSelectedHighlightElement] =
    useState<HTMLElement | null>(null);
  const [selectedHighlighId, setSelectedHighlightId] = useState<string | null>(
    null
  );
  const service = new AnnotationService();

  const dispatch = async (action: Action) => {
    switch (action.type) {
      case "ADD_RECORD":
        try {
          const sources = action.payload;
          if (state.feedbackId) {
            const creationStatus = service.addAnnotations(sources);
            toast.promise(creationStatus, {
              pending: "Saving...",
              success: "Saved",
              error: "Error saving please try again",
            });
            const res = await creationStatus;
            if (res.status !== 200) {
              return;
            }
            baseDispatch({type: "ADD_RECORD", payload: action.payload});
          } else {
            toast.error("Please select valid assignment");
          }
        } catch (err) {
          console.log(err);
        }
        break;
      case "ADD_FEEDBACK":
        try {
          const feedback = action.payload;
          const feedbackVal = await service.createFeedback(feedback);
          feedbackVal.assessmentId &&
            baseDispatch({
              type: "ADD_FEEDBACK",
              payload: feedbackVal,
            });
        } catch (err) {
          console.log(err);
        }
        break;
      case "DELETE_RECORD":
        try {
          const status = service.deleteAnnotation(action.payload);
          toast.promise(status, {
            pending: "Deleting...",
            success: "Deleted Highlight",
            error: "Error deleting please try again",
          });
          const res = await status;
          if (res.status !== 200) {
            return;
          }
          baseDispatch({type: "DELETE_RECORD", payload: action.payload});
        } catch (err) {
          console.log(err);
        }
        break;
      case "UPDATE_HIGHLIGHT_NOTES":
        try {
          const status = service.updateHighlightNotes(
            action.payload.id,
            action.payload.notes
          );
          toast.promise(status, {
            pending: "Updating...",
            success: "Updated Highlight",
            error: "Error updating please try again",
          });
          const res = await status;
          if (res.status !== 200) {
            return;
          }
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
      console.log(data);
      if (_node) {
        _node.innerHTML =
          `<span id=${`__highlight-${id}`}></span>` + _node.innerHTML;
      }
      if (data.type != "from-store") {
        dispatch({type: "SET_DRAFTING", payload: data.sources[0]});
      }
    };
    const handleClick = (data: {id: string}) => {
      // const currentSelected = state.records.find(
      //   (record) => record.id === data.id
      // ) as Annotation;

      const selectedArea = state.highlighterLib?.getDoms(data.id)[0];
      selectedArea ? setSelectedHighlightElement(selectedArea) : null;
      setSelectedHighlightId(data.id);
      dispatch({type: "SELECT_HIGHLIGHT", payload: data.id});
    };

    const handleHover = (data: {id: string}) => {
      const id = data.id;
      state.highlighterLib?.addClass("highlight-hover", id);
    };
    const handleHoverOut = (data: {id: string}) => {
      const id = data.id;
      state.highlighterLib?.removeClass("highlight-hover", id);
    };
    state.highlighterLib?.on(Highlighter.event.CREATE, handleCreate);
    state.highlighterLib?.on(Highlighter.event.CLICK, handleClick);
    state.highlighterLib?.on(Highlighter.event.HOVER_OUT, handleHoverOut);
    state.highlighterLib?.on(Highlighter.event.HOVER, handleHover);

    const records = state.records.map((highlight) => {
      state.highlighterLib?.fromStore(
        highlight.annotation.startMeta,
        highlight.annotation.endMeta,

        highlight.annotation.text,
        highlight.annotation.id
      );
      state.highlighterLib?.addClass(
        getClassForTag(highlight.annotation.annotationTag),
        highlight.annotation.id
      );
    });
    // Cleanup function to remove the listeners
    return () => {
      state.highlighterLib?.off(Highlighter.event.CREATE, handleCreate);
      state.highlighterLib?.off(Highlighter.event.CLICK, handleClick);
      state.highlighterLib?.off(Highlighter.event.HOVER_OUT, handleHoverOut);
    };
  }, [state.highlighterLib]);

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
