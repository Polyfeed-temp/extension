import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
} from "@material-tailwind/react";
import {Notes} from "./Notes";
import {
  useHighlighterState,
  useHighlighterDispatch,
} from "../store/HighlightContext";
import AnnotatedCard from "./AnnotatedCard";
import HighlightSource from "web-highlighter/dist/model/source";
import LabelDropdown from "./LabelDropdown";
import {useState} from "react";
import TodoCard from "./TodoCard";
function EditTab({
  text,
  isAddNotes,
  setIsAddNotes,
}: {
  text: string;
  setIsAddNotes: any;
  isAddNotes: boolean;
}) {
  return (
    <div>
      <LabelDropdown></LabelDropdown>
      {isAddNotes ? (
        <div>
          <Notes text={text}></Notes>

          <button>Save</button>
        </div>
      ) : (
        <TodoCard></TodoCard>
      )}
      <div>
        <button onClick={() => setIsAddNotes(true)}>Add Notes</button>
        <button onClick={() => setIsAddNotes(false)}>Add To do</button>
      </div>
    </div>
  );
}

export function DefaultSidebar() {
  const highlighterState = useHighlighterState();
  const highlighterDispatch = useHighlighterDispatch();
  const currerntEditing = highlighterState.editing;
  const [isAddNotes, setIsAddNotes] = useState(false);
  console.log(highlighterState.records);
  return (
    <div className="">
      <Card className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
        <div className="mb-2 p-4">
          <Typography variant="h5" color="blue-gray">
            Sidebar
          </Typography>
          <button
            onClick={() => {
              highlighterDispatch({
                type: "SET_IS_HIGHLIGHTING",
                payload: !highlighterState.isHighlighting,
              });
            }}
          >
            {highlighterState.isHighlighting ? "Disable" : "Enable"}
          </button>
        </div>
        <List>
          {currerntEditing ? (
            <EditTab
              text={currerntEditing.text}
              isAddNotes={isAddNotes}
              setIsAddNotes={setIsAddNotes}
            ></EditTab>
          ) : null}

          {highlighterState.records.map((record: HighlightSource) => (
            <AnnotatedCard
              text={record.text}
              onEdit={() => {
                highlighterDispatch({
                  type: "SET_EDITING",
                  payload: record,
                });
              }}
              onDelete={() => {
                highlighterDispatch({
                  type: "DELETE_RECORD",
                  payload: record,
                });
              }}
            />
          ))}
        </List>
      </Card>
    </div>
  );
}
