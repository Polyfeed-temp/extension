import "./App.css";
import {useState, useEffect} from "react";
import {DefaultSidebar} from "./components/Sidebar";
import {useDispatch, useSelector} from "react-redux";
import {
  setEnable,
  HighlighterState,
  setCurrentID,
} from "./store/highlightSlice";

function App() {
  const dispatcher = useDispatch();
  const enable = useSelector((state: HighlighterState) => state.enable);
  const id = useSelector((state: HighlighterState) => state.currentID);

  useEffect(() => {
    dispatcher(setCurrentID("123"));
  }, [dispatcher]);

  useEffect(() => {
    console.log("Enable:", enable);
  }, [enable]);

  return (
    <div>
      <DefaultSidebar />
      <button onClick={() => dispatcher(setEnable(!enable))}>Enable</button>
    </div>
  );
}

export default App;
