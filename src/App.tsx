import { Sidebar } from './components/Sidebar/Sidebar';
import { useLayoutEffect, useRef, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSidebar } from './hooks/useSidebar';

import { useHighlighterState } from './store/HighlightContext';
import PdfReviewer from './components/PdfReviewer';
import { Worker } from '@react-pdf-viewer/core';
import { useUserState } from './store/UserContext';

export function restoreHostDom() {
  const nav = document.querySelector('nav') as HTMLElement;
  nav.style.marginRight = '0';
  document.body.style.marginRight = '0';
}

function App() {
  const { collapsed, setCollapsed } = useSidebar();
  const userState = useUserState();
  // Use UserContext login state instead of local state
  const isAuth = userState.login && !userState.loading;

  const handleLogin = () => {
    // Login is now handled by UserContext, this is just for callback
  };

  const toggleSidebar = () => {
    // Just toggle the sidebar visibility, don't affect highlights
    setCollapsed(!collapsed);
  };

  const highlightState = useHighlighterState();
  const highlightStateRef = useRef(highlightState.highlighterLib);

  useEffect(() => {
    highlightStateRef.current = highlightState.highlighterLib;
  }, [highlightState.highlighterLib]);

  // Listen for messages from background script to toggle sidebar
  useEffect(() => {
    const handleMessage = (request: any) => {
      if (request.action === 'toggleSidebar') {
        toggleSidebar();
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [collapsed]);

  // Don't clean up highlight when sidebar toggles
  // Only clean up when the entire extension unmounts
  useLayoutEffect(() => {
    return () => {
      // Removed cleanup here - highlights should persist
    };
  }, []);

  // Don't render anything during initial loading to prevent flash
  if (userState.loading) {
    return null;
  }

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
