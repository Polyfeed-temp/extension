import "./App.css";
import {useState, useEffect} from "react";
import {DefaultSidebar} from "./components/Sidebar/Sidebar";
import DraggableWindow from "./components/Sidebar/FloatingSidebar";

function App() {
  return (
    <div>
      <DraggableWindow></DraggableWindow>
    </div>
  );
}

export default App;
