import { Sidebar } from "./components/Sidebar/Sidebar";
import {
  useState,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useEffect,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSidebar } from "./hooks/useSidebar";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import firebaseConfig from "../firebaseConfig.json";
import { setChromeLocalStorage } from "./services/localStorage";
import { User, Role, Faculty } from "./types";
import { checkUserExists, register } from "./services/user.service";
import { TOKEN_KEY } from "./services/api.service";
import { useHighlighterState } from "./store/HighlightContext";
// Your web app's Firebase configuration

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

provider.addScope("https://www.googleapis.com/auth/userinfo.email");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "login") {
    // console.log("Token here from app.tsx"+request.token);
    const credential = GoogleAuthProvider.credential(null, request.token);
    signInWithCredential(auth, credential)
      .then(async (result) => {
        // console.log("Successful Login for"+await result.user.getIdToken())

        const googleUser = result.user;

        console.log("googleUser", googleUser);

        const displayName: any = googleUser.displayName || googleUser.email;

        register(googleUser.email ?? "", displayName);

        setChromeLocalStorage({
          key: TOKEN_KEY,
          value: await googleUser.getIdToken(),
        });
      })
      .catch((error) => {
        console.log("Error in login");
      });
  }
});

export function restoreHostDom() {
  const nav = document.querySelector("nav") as HTMLElement;
  const docs = document.querySelector("#docs-chrome") as HTMLElement;
  nav.style.marginRight = "0";
  document.body.style.marginRight = "0";
}

function App() {
  const { collapsed, setCollapsed, location, setLocation } = useSidebar();
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  const sidebarWidth = "428px";
  const nav = document.querySelector("nav") as HTMLElement;
  const docs = document.querySelector("#docs-chrome") as HTMLElement;
  if (nav) {
    nav.style.marginRight = collapsed ? "40px" : sidebarWidth;
  }
  if (docs) {
    const docContainer = document.querySelector(
      ".kix-appview-editor-container"
    ) as HTMLElement;
    docContainer.style.width = "calc(100% - 428px)";
    docContainer.style.width = collapsed ? "" : "calc(100% - 428px)";
  }
  document.body.style.marginRight = collapsed ? "40px" : sidebarWidth;

  const highlightState = useHighlighterState();
  const highlightStateRef = useRef(highlightState.highlighterLib);

  useEffect(() => {
    highlightStateRef.current = highlightState.highlighterLib;
  }, [highlightState.highlighterLib]);

  //clean up highlight
  useLayoutEffect(() => {
    return () => {
      console.log("unmounting");

      const lib = highlightStateRef.current;
      if (lib) {
        lib.removeAll();
        lib.dispose();
      }
    };
  }, []);

  return (
    <div>
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        style={{ zIndex: 999999 }}
      />
    </div>
  );
}

export default App;
