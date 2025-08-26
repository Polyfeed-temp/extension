import { Sidebar } from './components/Sidebar/Sidebar';
import { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSidebar } from './hooks/useSidebar';

import { setChromeLocalStorage } from './services/localStorage';
import { TOKEN_KEY } from './services/api.service';
import { useHighlighterState } from './store/HighlightContext';
import { addLogs, eventType } from './services/logs.serivce';
import { useConsent } from './hooks/useConsentStore';
import { PdfReviewer } from './components/PdfReviewer';
import { Worker } from '@react-pdf-viewer/core';

export function restoreHostDom() {
  const nav = document.querySelector('nav') as HTMLElement;
  nav.style.marginRight = '0';
  document.body.style.marginRight = '0';
}

function App() {
  const { collapsed, setCollapsed } = useSidebar();
  const { accept } = useConsent();

  const [isAuth, setIsAuth] = useState(false);

  const handleLogin = () => {
    setIsAuth(true);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  const sidebarWidth = '428px';
  const nav = document.querySelector('nav') as HTMLElement;
  const docs = document.querySelector('#docs-chrome') as HTMLElement;
  if (nav) {
    nav.style.marginRight = collapsed ? '40px' : sidebarWidth;
  }
  if (docs) {
    const docContainer = document.querySelector(
      '.kix-appview-editor-container'
    ) as HTMLElement;
    docContainer.style.width = 'calc(100% - 428px)';
    docContainer.style.width = collapsed ? '' : 'calc(100% - 428px)';
  }
  document.body.style.marginRight = collapsed ? '40px' : sidebarWidth;

  const highlightState = useHighlighterState();
  const highlightStateRef = useRef(highlightState.highlighterLib);

  useEffect(() => {
    highlightStateRef.current = highlightState.highlighterLib;
  }, [highlightState.highlighterLib]);

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
    <Worker workerUrl={chrome.runtime.getURL('/scripts/pdf.worker.min.js')}>
      <div>
        <Sidebar
          isAuth={isAuth}
          collapsed={collapsed}
          toggleSidebar={toggleSidebar}
          onLogin={handleLogin}
        />

        {PdfReviewer && <PdfReviewer />}

        <ToastContainer
          position="bottom-right"
          theme="dark"
          style={{ zIndex: 999999 }}
        />
      </div>
    </Worker>
  );
}

export default App;
