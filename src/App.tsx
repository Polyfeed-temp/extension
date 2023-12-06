// import "./App.css";
import {Sidebar} from "./components/Sidebar/Sidebar";
import {useState} from "react";

function App() {
  const [collapsed, setCollapsed] = useState(true);

  const toggleSidebar = () => {
    const sidebarWidth = "428px";
    const nav = document.querySelector("nav") as HTMLElement;
    const docs = document.querySelector("#docs-chrome") as HTMLElement;
    if (nav != null) {
      document.body.style.marginRight = collapsed ? sidebarWidth : "40px";
      nav.style.marginRight = collapsed ? sidebarWidth : "40px";
      setCollapsed(!collapsed);
    }
    else if (docs != null) {
      document.body.style.marginRight = collapsed ? sidebarWidth : "40px";
      docs.style.marginRight = collapsed ? sidebarWidth : "40px";
      setCollapsed(collapsed);

      const docContainer = document.querySelector(".kix-appview-editor-container") as HTMLElement;
      docContainer.style.width = "calc(100% - 428px)";

      if (!collapsed){
        docContainer.style.width = "";
      }
      else{
        docContainer.style.width = "calc(100% - 428px)";
      }
    }
  };
  return (
    <div>
      {" "}
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default App;
