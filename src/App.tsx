import "./App.css";
import {useState} from "react";
import {highlighter} from "./store/highlighter.store";
function App() {
  const [counter, setCounter] = useState(0);
  highlighter.run();
  return (
    <div>
      <button onClick={() => setCounter(counter + 1)}> increase</button>
      <h1>{counter}</h1>
    </div>
  );
}

export default App;
