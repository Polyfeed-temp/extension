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
import {useDispatch, useSelector} from "react-redux";
import {HighlighterState} from "../store/highlightSlice";
export function DefaultSidebar() {
  const dispatcher = useDispatch();
  const currentID = useSelector((state: HighlighterState) => state.currentID);

  return (
    <div className="">
      <Card className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
        <div className="mb-2 p-4">
          <Typography variant="h5" color="blue-gray">
            Sidebar
          </Typography>
        </div>
        <List>
          <Notes text={currentID}></Notes>
        </List>
      </Card>
    </div>
  );
}
