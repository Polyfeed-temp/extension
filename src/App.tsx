import { Sidebar } from './components/Sidebar/Sidebar';
import { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSidebar } from './hooks/useSidebar';

import { useHighlighterState } from './store/HighlightContext';
import PdfReviewer from './components/PdfReviewer';
import { Worker } from '@react-pdf-viewer/core';
import { useUserState } from './store/UserContext';

export function restoreHostDom() {
  const nav = document.querySelector('nav') as HTMLElement;
  if (nav) {
    nav.style.marginRight = '0';
  }
  document.body.style.marginRight = '0';
}

function App() {
  const { collapsed, setCollapsed } = useSidebar();
  const userState = useUserState();
  // Use UserContext login state instead of local state
  const isAuth = userState.login && !userState.loading;

  // Track if extension is currently open (controlled by toolbar icon)
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);

  const handleLogin = () => {
    // Login is now handled by UserContext, this is just for callback
  };

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);

    // Adjust page margins based on collapse state
    const sidebarWidth = '428px';
    const nav = document.querySelector('nav') as HTMLElement;

    if (newCollapsed) {
      // Sidebar is collapsing - remove margin to avoid white space
      if (nav) {
        nav.style.marginRight = '0';
        nav.style.transition = 'margin-right 0.3s ease';
      }
      document.body.style.marginRight = '0';
      document.body.style.transition = 'margin-right 0.3s ease';
    } else {
      // Sidebar is expanding - add margin to push content
      if (nav) {
        nav.style.marginRight = sidebarWidth;
        nav.style.transition = 'margin-right 0.3s ease';
      }
      document.body.style.marginRight = sidebarWidth;
      document.body.style.transition = 'margin-right 0.3s ease';
    }
  };

  const highlightState = useHighlighterState();
  const highlightStateRef = useRef(highlightState.highlighterLib);

  useEffect(() => {
    highlightStateRef.current = highlightState.highlighterLib;
  }, [highlightState.highlighterLib]);

  // Listen for messages from background script to toggle extension
  useEffect(() => {
    const handleMessage = (request: any) => {
      if (request.action === 'toggleSidebar') {
        // Toggle entire extension open/close
        const newIsOpen = !isExtensionOpen;
        setIsExtensionOpen(newIsOpen);

        // When opening extension, show expanded sidebar by default
        if (newIsOpen) {
          setCollapsed(false);
        }
        // Page margin adjustments are handled by useLayoutEffect
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [isExtensionOpen]);

  // Sync page margin with extension and sidebar state, cleanup on unmount
  useLayoutEffect(() => {
    const sidebarWidth = '428px';
    const nav = document.querySelector('nav') as HTMLElement;

    if (isExtensionOpen && !collapsed) {
      // Extension is open and sidebar is expanded - apply margin to push content
      if (nav) {
        nav.style.marginRight = sidebarWidth;
        nav.style.transition = 'margin-right 0.3s ease';
      }
      document.body.style.marginRight = sidebarWidth;
      document.body.style.transition = 'margin-right 0.3s ease';
    } else {
      // Extension is closed or sidebar is collapsed - remove margin
      if (nav) {
        nav.style.marginRight = '0';
        nav.style.transition = 'margin-right 0.3s ease';
      }
      document.body.style.marginRight = '0';
      document.body.style.transition = 'margin-right 0.3s ease';
    }

    // Cleanup when component unmounts
    return () => {
      restoreHostDom();
    };
  }, [isExtensionOpen, collapsed]);

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
          isActivated={isExtensionOpen}
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
