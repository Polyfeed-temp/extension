// import "./App.css";
import {Sidebar} from "./components/Sidebar/Sidebar";
import {useState} from "react";

function App() {
  const [collapsed, setCollapsed] = useState(true);

  const toggleSidebar = () => {
    const sidebarWidth = "428px";
    const nav = document.querySelector("nav") as HTMLElement;
    document.body.style.marginRight = collapsed ? sidebarWidth : "40px";
    nav ? (nav.style.marginRight = collapsed ? sidebarWidth : "40px") : null;
    setCollapsed(!collapsed);
  };
  return (
    <div>
      {" "}
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default App;
