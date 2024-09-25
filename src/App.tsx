import { Sidebar } from "./components/Sidebar/Sidebar";
import { useLayoutEffect, useRef, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSidebar } from "./hooks/useSidebar";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth/web-extension";
import firebaseConfig from "../firebaseConfig.json";
import { setChromeLocalStorage } from "./services/localStorage";
import { register } from "./services/user.service";
import { TOKEN_KEY } from "./services/api.service";
import { useHighlighterState } from "./store/HighlightContext";
import { addLogs, eventType } from "./services/logs.serivce";
import { useConsent } from "./hooks/useConsentStore";
// Your web app's Firebase configuration

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

provider.addScope("https://www.googleapis.com/auth/userinfo.email");

export function restoreHostDom() {
  const nav = document.querySelector("nav") as HTMLElement;
  nav.style.marginRight = "0";
  document.body.style.marginRight = "0";
}

function App() {
  const { collapsed, setCollapsed } = useSidebar();
  const { accept, setTokenFromBrowser, tokenFromBrowser } = useConsent();

  const [isAuth, setIsAuth] = useState(false);

  const firebaseLogin = (token: string) => {
    const credential = GoogleAuthProvider.credential(null, token);
    toast.loading("Logging in...", {
      toastId: 2,
    });

    signInWithCredential(auth, credential)
      .then(async (result) => {
        const googleUser = result.user;
        const displayName: any = googleUser.displayName || googleUser.email;

        await register(googleUser.email ?? "", displayName);

        setChromeLocalStorage({
          key: TOKEN_KEY,
          value: await googleUser.getIdToken(),
        });

        setIsAuth(true);

        await addLogs({
          eventType: eventType[5],
          content: "",
          eventSource: "",
        });

        toast.update(2, {
          render: "Successfully logged in to PolyFeed student extension",
          type: "success",
          hideProgressBar: true,
          autoClose: 1000,
          isLoading: false,
        });
      })
      .catch(() => {
        toast.error("Error in Firebase login.");
      });
  };

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

  useEffect(() => {
    chrome.runtime.onMessage.addListener(async function (request) {
      if (!request.token) {
        console.log("token null");
        toast.error("Please refresh page");
        return;
      }

      console.log("request.token", request.token);
      setTokenFromBrowser(request.token);
    });
  }, [firebaseLogin, setTokenFromBrowser]);

  useEffect(() => {
    if (accept && tokenFromBrowser) firebaseLogin(tokenFromBrowser);
  }, [accept, tokenFromBrowser]);

  //clean up highlight
  useLayoutEffect(() => {
    return () => {
      const lib = highlightStateRef.current;
      if (lib) {
        lib.removeAll();
        lib.dispose();
      }
    };
  }, []);

  return (
    <div>
      <Sidebar
        isAuth={isAuth}
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        firebaseLogin={firebaseLogin}
      />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        style={{ zIndex: 999999 }}
      />
    </div>
  );
}

export default App;
