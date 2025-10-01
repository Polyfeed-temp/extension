import React, {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from 'react';
import Highlighter from 'web-highlighter';
import HighlightSource from 'web-highlighter/dist/model/source';
import AnnotationService from '../services/annotation.service';
import { RenderPop } from '../components/Toolbar';
import {
  Annotation,
  SideBarAction,
  AnnotationData,
  Feedback,
  getClassForTag,
  AnnotationActionPoint,
} from '../types';
import { toast } from 'react-toastify';
// Removed useSidebar import - sidebar control now handled by user via toolbar/toggle
import { addLogs, eventSource, eventType } from '../services/logs.serivce';
import { useFileStore } from './fileStore';
import {
  findAndHighlightText,
  removeHighlight,
  removeAllHighlights,
  highlightExists
} from '../utils/textHighlighter';

interface HighlightState {
  highlighterLib: Highlighter | null;
  feedbackInfo: Feedback | null;
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
  type: 'INITIALIZE';
  payload: Feedback | null;
}

interface AddFeedbackAction {
  type: 'ADD_FEEDBACK';
  payload: Feedback;
}
interface AddRecordAction {
  type: 'ADD_RECORD';
  payload: AnnotationData;
}

interface AddRecordPdfAction {
  type: 'ADD_RECORD_PDF';
  payload: AnnotationData;
}

interface SetEditingAction {
  type: 'SET_EDITING';
  payload: { sidebarAction: SideBarAction; annotation: Annotation };
}

interface SetIsHighlightingAction {
  type: 'SET_IS_HIGHLIGHTING';
  payload: boolean;
}

interface DeleteRecordAction {
  type: 'DELETE_RECORD';
  payload: string;
}
interface SetDraftingAction {
  type: 'SET_DRAFTING';
  payload: HighlightSource;
}

interface UpdateHighlight {
  type: 'UPDATE_HIGHLIGHT_NOTES';
  payload: { id: string; notes: string };
}
interface DeleteAllHighlights {
  type: 'DELETE_ALL_HIGHLIGHTS';
}
interface DeleteFeedback {
  type: 'DELETE_FEEDBACK';
}
interface AddActionItem {
  type: 'ADD_ACTION_ITEM';
  payload: { id: string; actionItem: AnnotationActionPoint };
}
interface CancelHighlighted {
  type: 'CANCEL_HIGHLIGHTED';
}
interface UpdateActionItems {
  type: 'UPDATE_HIGHLIGHT_ACTION_ITEMS';
  payload: { id: string; actionItems: AnnotationActionPoint[] };
}
interface SyncWithServerAction {
  type: 'SYNC_WITH_SERVER';
  payload: Feedback | null;
}
type Action =
  | AddRecordAction
  | AddRecordPdfAction
  | SetEditingAction
  | SetIsHighlightingAction
  | DeleteRecordAction
  | InitializeAction
  | SetDraftingAction
  | AddFeedbackAction
  | UpdateHighlight
  | DeleteAllHighlights
  | DeleteFeedback
  | AddActionItem
  | CancelHighlighted
  | UpdateActionItems
  | SyncWithServerAction;

const HighlighterContext = createContext<
  | {
      state: HighlightState;
      dispatch: React.Dispatch<Action>;
      handleDelete: (id: string) => Promise<void>;
    }
  | undefined
>(undefined);

const highlighterReducer = (
  state: HighlightState,
  action: Action
): HighlightState => {
  switch (action.type) {
    case 'INITIALIZE':
      // Only create a new highlighter if one doesn't exist
      let lib = state.highlighterLib;
      if (!lib) {
        const root = document.getElementById(
          'docos-stream-view'
        ) as HTMLElement;
        lib = new Highlighter({
          $root: root ? root : document.documentElement,
          // wrapTag: "span",
          exceptSelectors: ['#react-root', 'img', 'footer'],
          // "img", "br",
        });
      }

      const initialState: HighlightState = {
        highlighterLib: lib,
        records: action.payload?.highlights ? action.payload.highlights : [],
        editing: null,
        isHighlighting: false,
        feedbackInfo: action.payload,
        drafting: null,
        unlabledHighlights: [],
      };
      // Don't automatically expand sidebar - let user control via toolbar/toggle button

      return { ...state, ...initialState };
    case 'SET_DRAFTING':
      return {
        ...state,
        drafting: action.payload,
        unlabledHighlights: [...state.unlabledHighlights, action.payload],
      };
    case 'ADD_RECORD':
      //after adding record to db, add to state and remove from current editing and drafting
      return {
        ...state,
        editing: null,
        drafting: null,
        records: [...state.records, action.payload],
      };
    case 'ADD_RECORD_PDF':
      //after adding PDF record to db, add to state but DON'T trigger web highlight rendering
      console.log('[PDF] ADD_RECORD_PDF - Adding PDF highlight only');
      return {
        ...state,
        editing: null,
        drafting: null,
        records: [...state.records, action.payload],
      };
    case 'SET_EDITING':
      return { ...state, editing: action.payload };
    case 'SET_IS_HIGHLIGHTING':
      console.log('[Highlight Debug] SET_IS_HIGHLIGHTING:', action.payload);
      if (action.payload) {
        console.log('[Highlight Debug] Starting highlighter.run()');
        state.highlighterLib?.run();
      } else {
        console.log('[Highlight Debug] Stopping highlighter.stop()');
        state.highlighterLib?.stop();
      }
      return { ...state, isHighlighting: action.payload };
    case 'DELETE_RECORD':
      const newRecords = state.records.filter(
        (record) => record.annotation.id !== action.payload
      );
      state.highlighterLib?.remove(action.payload);

      // Update PDF viewer
      const { selectedFile, setAssociatedHighlights } = useFileStore.getState();
      if (selectedFile) {
        // Get the updated feedback to ensure we have the latest highlights
        const annotationService = new AnnotationService();
        annotationService.getCurrentPageFeedback().then((newFeedback) => {
          if (newFeedback?.highlights) {
            // Filter highlights for current file using all methods
            const newAssociatedHighlights = newFeedback.highlights.filter(
              (highlight) => {
                const annotation = highlight?.annotation;
                if (!annotation) return false;

                // Method 1: Check comprehensive data in startMeta
                try {
                  const parsed = JSON.parse(annotation.startMeta?.parentTagName || '');
                  if (parsed.fileId == selectedFile.id) return true;
                } catch {}

                // Method 2: Check comprehensive data in endMeta (legacy location)
                try {
                  const parsed = JSON.parse(annotation.endMeta?.parentTagName || '');
                  if (parsed.fileId == selectedFile.id) return true;
                } catch {}

                // Method 3: Check if endMeta.parentTagName is the file ID directly
                if (annotation.endMeta?.parentTagName === selectedFile.id.toString()) {
                  return true;
                }

                // Method 4: Check if startMeta.parentTagName is the file ID directly
                if (annotation.startMeta?.parentTagName === selectedFile.id.toString()) {
                  return true;
                }

                return false;
              }
            );

            // Update highlights without clearing the file
            setAssociatedHighlights(newAssociatedHighlights);
          }
        });
      }

      return { ...state, records: newRecords };
    case 'ADD_FEEDBACK':
      return { ...state, feedbackInfo: action.payload };
    case 'DELETE_ALL_HIGHLIGHTS':
      return { ...state, records: [] };
    case 'DELETE_FEEDBACK':
      return { ...state, feedbackInfo: null, records: [] };
    case 'ADD_ACTION_ITEM':
      const record = state.records.find(
        (record) => record.annotation.id === action.payload.id
      );
      if (record) {
        record.actionItems ??= [];
        record.actionItems.push(action.payload.actionItem);
      }

      return { ...state };
    case 'UPDATE_HIGHLIGHT_NOTES':
      const recordToUpdate = state.records.find(
        (record) => record.annotation.id === action.payload.id
      );
      if (recordToUpdate) {
        recordToUpdate.annotation.notes = action.payload.notes;
      }
      return { ...state, editing: null, drafting: null };
    case 'CANCEL_HIGHLIGHTED':
      state.highlighterLib?.remove(state.drafting?.id || '');
      return { ...state, editing: null, drafting: null };
    case 'UPDATE_HIGHLIGHT_ACTION_ITEMS':
      const recordToUpdateAction = state.records.find(
        (record) => record.annotation.id === action.payload.id
      );
      if (recordToUpdateAction) {
        recordToUpdateAction.actionItems = action.payload.actionItems;
      }
      return { ...state, editing: null, drafting: null };
    case 'SYNC_WITH_SERVER':
      return {
        ...state,
        feedbackInfo: action.payload,
        records: action.payload?.highlights || [],
      };
    default:
      return state;
  }
};

export const HighlighterProvider = ({ children }: { children: ReactNode }) => {
  const initialState: HighlightState = {
    highlighterLib: null,
    records: [],
    editing: null,
    isHighlighting: false,
    drafting: null,
    unlabledHighlights: [],
    feedbackInfo: null,
  };

  // Removed setCollapsed - sidebar control now handled by user via toolbar/toggle
  const [state, baseDispatch] = useReducer(highlighterReducer, initialState);
  const [selectedHighlightElement, setSelectedHighlightElement] =
    useState<Element | null>(null);
  const [selectedHighlighId, setSelectedHighlightId] = useState<string | null>(
    null
  );

  const [doubleClick, setDoubleClick] = useState(false);
  const service = new AnnotationService();

  const dispatch = async (action: Action) => {
    switch (action.type) {
      case 'ADD_RECORD_PDF':
        // Handle PDF highlights separately - same API call but different action type
        console.log('[PDF] Handling ADD_RECORD_PDF dispatch');
        try {
          let sources = action.payload;
          if (state.feedbackInfo) {
            // PDF highlights already have comprehensive data in startMeta
            addLogs({
              eventType: eventType[2],
              content: JSON.stringify(sources),
              eventSource: eventSource[0],
            });

            const creationStatus = service.addAnnotations(sources);
            toast.promise(creationStatus, {
              pending: 'Saving PDF highlight...',
              success: 'PDF highlight saved',
              error: 'Error saving PDF highlight',
            });
            const res = await creationStatus;
            if (res.status !== 200) {
              return;
            }
            baseDispatch({ type: 'ADD_RECORD_PDF', payload: action.payload });
          } else {
            toast.error('Please select valid assignment');
          }
        } catch (err) {
          console.error('[PDF] Error in ADD_RECORD_PDF:', err);
        }
        break;
      case 'ADD_RECORD':
        try {
          let sources = action.payload;
          if (state.feedbackInfo) {
            // Store original comprehensive data - now in startMeta
            const originalStartMeta = sources.annotation.startMeta;
            const hasComprehensiveData = (() => {
              try {
                const parsed = JSON.parse(originalStartMeta.parentTagName);
                const isComprehensive = !!(
                  parsed.highlightAreas || parsed.source
                );
                return isComprehensive;
              } catch {
                return false;
              }
            })();

            // Only modify metadata for PDF highlights, not web highlights
            const isPdfRelated = hasComprehensiveData ||
                                (!isNaN(Number(sources.annotation.endMeta.parentTagName)));

            if (isPdfRelated && (doubleClick ||
                (sources.annotation.endMeta.parentTagName != 'P' &&
                 !hasComprehensiveData))
            ) {
              // Only overwrite if we don't have comprehensive data
              const fileId = hasComprehensiveData
                ? JSON.parse(originalStartMeta.parentTagName).fileId
                : sources.annotation.endMeta.parentTagName;

              sources = {
                ...sources,
                annotation: {
                  ...sources.annotation,
                  endMeta: {
                    parentIndex: sources.annotation.startMeta.parentIndex,
                    parentTagName: fileId, // Use file ID from comprehensive data or fallback
                    textOffset: sources.annotation.text.length,
                  },
                },
              };
            }

            addLogs({
              eventType: eventType[2],
              content: JSON.stringify(sources),
              eventSource: eventSource[0],
            });

            const creationStatus = service.addAnnotations(sources);
            toast.promise(creationStatus, {
              pending: 'Saving...',
              success: 'Saved',
              error: 'Error saving please try again',
            });
            const res = await creationStatus;
            if (res.status !== 200) {
              return;
            }
            baseDispatch({ type: 'ADD_RECORD', payload: action.payload });
          } else {
            toast.error('Please select valid assignment');
          }
        } catch (err) {}
        break;
      case 'DELETE_RECORD':
        try {
          const status = service.deleteAnnotation(action.payload);
          toast.promise(status, {
            pending: 'Deleting...',
            success: 'Deleted Highlight',
            error: 'Error deleting please try again',
          });
          const res = await status;
          if (res.status !== 200) {
            return;
          }

          addLogs({
            eventType: eventType[8],
            content: JSON.stringify(action.payload),
            eventSource: eventSource[0],
          });

          baseDispatch({ type: 'DELETE_RECORD', payload: action.payload });
        } catch (err) {}
        break;
      case 'UPDATE_HIGHLIGHT_NOTES':
        try {
          const status = service.updateHighlightNotes(
            action.payload.id,
            action.payload.notes
          );
          toast.promise(status, {
            pending: 'Updating...',
            success: 'Updated Highlight',
            error: 'Error updating please try again',
          });
          const res = await status;
          if (res.status !== 200) {
            return;
          }

          addLogs({
            eventType: eventType[3],
            content: JSON.stringify(action.payload),
            eventSource: eventSource[3],
          });

          baseDispatch({
            type: 'UPDATE_HIGHLIGHT_NOTES',
            payload: action.payload,
          });
        } catch (err) {}

        break;
      case 'DELETE_ALL_HIGHLIGHTS':
        try {
          const status = state.feedbackInfo?.id
            ? service.deleteAllHighlights(state.feedbackInfo.id)
            : undefined;
          if (status) {
            toast.promise(status, {
              pending: 'Deleting all highlights...',
              success: 'Deleted Highlight',
              error: 'Error deleting please try again',
            });
            const res = await status;
            if (res.status == 200) {
              addLogs({
                eventType: eventType[8],
                content: 'delete all highlights',
                eventSource: eventSource[0],
              });

              state.highlighterLib?.removeAll();
              baseDispatch({ type: 'DELETE_ALL_HIGHLIGHTS' });
            }
          }
        } catch (err) {}
        break;
      case 'DELETE_FEEDBACK':
        try {
          const status = state.feedbackInfo?.id
            ? service.deleteFeedback(state.feedbackInfo.id)
            : undefined;
          if (status) {
            toast.promise(status, {
              pending: 'Deleting feedback...',
              success: 'Deleted feedback',
              error: 'Error deleting please try again',
            });
            const res = await status;
            if (res.status == 200) {
              addLogs({
                eventType: eventType[8],
                content: `${state.feedbackInfo?.id}` || '',
                eventSource: eventSource[0],
              });
              state.highlighterLib?.removeAll();
              baseDispatch({ type: 'DELETE_FEEDBACK' });
            }
          }
        } catch (err) {}
        break;
      case 'ADD_ACTION_ITEM':
        try {
          const status = service.addActionItem(
            action.payload.id,
            action.payload.actionItem
          );
          toast.promise(status, {
            pending: 'Adding suggestion...',
            success: 'Added suggestion',
            error: 'Error adding suggestion please try again',
          });

          addLogs({
            eventType: eventType[2],
            content: JSON.stringify({
              id: action.payload.id,
              actionItem: action.payload.actionItem,
            }),
            eventSource: eventSource[9],
          });

          const res = await status;
          if (res.status == 200) {
            baseDispatch({ type: 'ADD_ACTION_ITEM', payload: action.payload });
          }
        } catch (err) {}
        break;
      case 'UPDATE_HIGHLIGHT_ACTION_ITEMS':
        try {
          const status = service.updateHighlightActionItem(
            action.payload.id,
            action.payload.actionItems
          );

          toast.promise(status, {
            pending: 'Updating action plans...',
            success: 'Updated action plans',
            error: 'Error updating action plans please try again',
          });

          addLogs({
            eventType: eventType[3],
            content: JSON.stringify({
              id: action.payload.id,
              actionItem: action.payload.actionItems,
            }),
            eventSource: eventSource[9],
          });

          const res = await status;
          if (res.status == 200) {
            baseDispatch({
              type: 'UPDATE_HIGHLIGHT_ACTION_ITEMS',
              payload: action.payload,
            });

            const feedback = await service.getCurrentPageFeedback();

            baseDispatch({ type: 'INITIALIZE', payload: feedback });
          }
        } catch (err) {}
        break;
      case 'SYNC_WITH_SERVER':
        return { ...state, feedbackInfo: action.payload };
      default:
        baseDispatch(action);
    }
  };

  useEffect(() => {
    addEventListener('click', (event: any) => {
      switch (event.detail) {
        case 1:
          setDoubleClick(false);
          break;
        case 2:
        case 3:
          setDoubleClick(true);
          break;
      }
    });

    const handleCreate = (data: {
      sources: HighlightSource[];
      type: string;
    }) => {
      console.log('[Highlight Debug] handleCreate called:', {
        type: data.type,
        sourcesCount: data.sources.length,
        firstSource: data.sources[0]
      });

      const id = data.sources[0].id;
      const _node = state.highlighterLib?.getDoms(id)[0];
      if (_node) {
        _node.id = `__highlight-${id}`;
      }

      if (data.type != 'from-store') {
        console.log('[Highlight Debug] Creating new highlight (not from store)');
        let payload = data.sources[0];

        dispatch({ type: 'SET_DRAFTING', payload });
      } else {
        console.log('[Highlight Debug] Highlight is from store, skipping SET_DRAFTING');
      }
    };

    const handleClick = (data: { id: string }) => {
      const selectedArea = state.highlighterLib?.getDoms(data.id)[0];
      selectedArea ? setSelectedHighlightElement(selectedArea) : null;
      setSelectedHighlightId(data.id);
      // dispatch({type: "SELECT_HIGHLIGHT", payload: data.id});

      // Don't automatically expand sidebar - let user control via toggle button
      const hostElement = document.getElementById('sidebar-root');
      const sidebarShadowRoot = hostElement?.shadowRoot;
      //remove selected focus
      sidebarShadowRoot?.querySelectorAll('.selected').forEach((elem) => {
        elem.classList.remove('selected');
      });
      const cardView = sidebarShadowRoot?.getElementById(
        `card-view-${data.id}`
      );
      cardView?.classList.add('selected');
      // const cardView = document.getElementById(`card-view-${data.id}`);

      cardView?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleHover = (data: { id: string }) => {
      const id = data.id;
      state.highlighterLib?.addClass('highlight-hover', id);
    };
    const handleHoverOut = (data: { id: string }) => {
      const id = data.id;
      state.highlighterLib?.removeClass('highlight-hover', id);
    };

    state.highlighterLib?.on(Highlighter.event.CREATE, handleCreate);
    state.highlighterLib?.on(Highlighter.event.CLICK, handleClick);
    state.highlighterLib?.on(Highlighter.event.HOVER_OUT, handleHoverOut);
    state.highlighterLib?.on(Highlighter.event.HOVER, handleHover);

    // Only render web highlights, not PDF highlights
    // Filter for web highlights only
    const webHighlights = state.records.filter((highlight) => {
      // Check if this is a PDF highlight
      // Note: startMeta and endMeta are objects, not strings!
      const startMetaTag = highlight.annotation.startMeta?.parentTagName || '';
      const endMetaTag = highlight.annotation.endMeta?.parentTagName || '';

      // PDF highlights have JSON data in startMetaTag or numeric IDs in endMetaTag
      const isPdfHighlight = (() => {
        // Check if startMetaTag contains JSON with fileId
        try {
          const parsed = JSON.parse(startMetaTag);
          if (parsed.fileId || parsed.highlightAreas) {
            return true;
          }
        } catch {}

        // Check if endMetaTag is a numeric file ID
        if (!isNaN(Number(endMetaTag)) && endMetaTag !== 'P' && endMetaTag !== '') {
          return true;
        }

        return false;
      })();

      // Only include web highlights
      return !isPdfHighlight;
    });

    // ============================================
    // USE CUSTOM TEXT-BASED HIGHLIGHTER
    // Replaces web-highlighter library
    // ============================================

    // Clear existing highlights first
    webHighlights.forEach((highlight) => {
      removeHighlight(highlight.annotation.id);
    });

    // Render each web highlight using custom text search
    webHighlights.forEach((highlight) => {
      const highlightId = highlight.annotation.id;
      const text = highlight.annotation.text.trim();
      const tag = highlight.annotation.annotationTag;

      // Use custom text-based highlighter
      findAndHighlightText({
        text: text,
        id: highlightId,
        className: getClassForTag(tag),
        containerSelector: 'body' // Search in the whole page
      });
    });

    // Cleanup function to remove the listeners
    return () => {
      state.highlighterLib?.off(Highlighter.event.CREATE, handleCreate);
      state.highlighterLib?.off(Highlighter.event.CLICK, handleClick);
      state.highlighterLib?.off(Highlighter.event.HOVER_OUT, handleHoverOut);
    };
  }, [state]);

  // monitor the expand icon onclick
  useEffect(() => {
    const handleIconClick = () => {
      // Get web highlights to re-render
      const webHighlights = state.records.filter((highlight) => {
        const startMetaTag = highlight.annotation.startMeta?.parentTagName || '';
        const endMetaTag = highlight.annotation.endMeta?.parentTagName || '';

        const isPdfHighlight = (() => {
          try {
            const parsed = JSON.parse(startMetaTag);
            if (parsed.fileId || parsed.highlightAreas) return true;
          } catch {}

          if (!isNaN(Number(endMetaTag)) && endMetaTag !== 'P' && endMetaTag !== '') {
            return true;
          }

          return false;
        })();

        return !isPdfHighlight;
      });

      const reHighlightAll = () => {
        webHighlights.forEach((highlight) => {
          const highlightId = highlight.annotation.id;
          const text = highlight.annotation.text.trim();
          const tag = highlight.annotation.annotationTag;

          // Remove existing highlight first
          removeHighlight(highlightId);

          // Re-apply highlight using custom text search
          findAndHighlightText({
            text: text,
            id: highlightId,
            className: getClassForTag(tag),
            containerSelector: 'body'
          });
        });
      };

      // Use multiple delays to ensure we catch the DOM update
      // This handles both fast and slow DOM updates
      // Collapse needs longer delays because Moodle animation is slow
      setTimeout(reHighlightAll, 100);
      setTimeout(reHighlightAll, 400);
      setTimeout(reHighlightAll, 700);
      setTimeout(reHighlightAll, 1000);
      setTimeout(reHighlightAll, 1500);
    };

    // Polling function to wait for expand/collapse buttons
    const waitForIcons = setInterval(() => {
      const expandIcons = document.querySelectorAll('i[title][title="View full"]');
      const collapseIcons = document.querySelectorAll('i[title][title="View summary"]');

      if (expandIcons.length > 0 || collapseIcons.length > 0) {
        clearInterval(waitForIcons);

        // Add listeners to expand buttons
        expandIcons.forEach(icon => {
          icon.addEventListener('click', handleIconClick);
        });

        // Add listeners to collapse buttons
        collapseIcons.forEach(icon => {
          icon.addEventListener('click', handleIconClick);
        });
      }
    }, 500);

    // Cleanup
    return () => {
      clearInterval(waitForIcons);

      const expandIcons = document.querySelectorAll('i[title][title="View full"]');
      const collapseIcons = document.querySelectorAll('i[title][title="View summary"]');

      expandIcons.forEach(icon => {
        icon.removeEventListener('click', handleIconClick);
      });

      collapseIcons.forEach(icon => {
        icon.removeEventListener('click', handleIconClick);
      });
    };
  }, [state]);

  const handleDelete = async (id: string) => {
    // First delete locally
    dispatch({ type: 'DELETE_RECORD', payload: id });

    // Then sync with server
    const annotationService = new AnnotationService();
    const newFeedback = await annotationService.getCurrentPageFeedback();
    dispatch({ type: 'SYNC_WITH_SERVER', payload: newFeedback });
  };

  return (
    <HighlighterContext.Provider value={{ state, dispatch, handleDelete }}>
      {children}
      {state.drafting && <RenderPop highlighting={state.drafting}></RenderPop>}
    </HighlighterContext.Provider>
  );
};

export const useHighlighterState = () => {
  const context = useContext(HighlighterContext);
  if (!context) {
    throw new Error(
      'useHighlighterState must be used within a HighlighterProvider'
    );
  }
  return context.state;
};

export const useHighlighterDispatch = () => {
  const context = useContext(HighlighterContext);
  if (!context) {
    throw new Error(
      'useHighlighterDispatch must be used within a HighlighterProvider'
    );
  }
  return context.dispatch;
};

export const useHighlighterDelete = () => {
  const context = useContext(HighlighterContext);
  if (!context) {
    throw new Error(
      'useHighlighterDelete must be used within a HighlighterProvider'
    );
  }
  return context.handleDelete;
};
