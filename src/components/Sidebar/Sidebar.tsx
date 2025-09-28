import React, { useState, useEffect } from 'react';
import SidebarPanel from './SidebarContent';

import { SidebarHeader } from './SidebarHeader';
const Logo = require('../../assets/logo/PolyFeed_Social_White.png')
  .default as string;
import { leftChevron, rightChevron } from '../AnnotationIcons';
import { useConsent } from '../../hooks/useConsentStore';
import { LoginView } from '../Consent/LoginView';
import { ConsentView } from '../Consent/Consent';
import SignUpPopup from '../SignUpPopUp';

export function Sidebar({
  collapsed,
  toggleSidebar,
  onLogin,
  isAuth,
  isActivated,
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
  onLogin: () => void;
  isAuth: boolean;
  isActivated: boolean;
}) {
  const { accept, handleDisagree, handleAgree } = useConsent();
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignUp = () => {
    setShowSignUp(true);
  };

  const closeSignUp = () => {
    setShowSignUp(false);
  };

  return (
    <>
      {/* Collapse button - only visible after extension is activated */}
      {isActivated && (
        <div
          className="fixed top-1/2 transform -translate-y-1/2"
          style={{
            right: collapsed ? '20px' : '440px', // Adjust position based on sidebar state
            zIndex: 10000,
            transition: 'right 0.3s ease',
          }}
        >
        <button
          onClick={toggleSidebar}
          className="p-2 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        </div>
      )}

      {/* Sidebar content - only show when activated */}
      {isActivated && !collapsed && (
        <div
          className="fixed top-0 right-0 h-full border-solid border-4 border-sky-500"
          style={{
            width: '428px',
            zIndex: 9999,
            backgroundColor: 'white',
            transition: 'right 0.3s ease',
          }}
        >
          {isAuth && (
            <div style={{ overflowY: 'auto', height: '100%' }}>
              <SidebarHeader />
              <SidebarPanel />
            </div>
          )}

          {!accept && !isAuth && (
            <div style={{ overflowY: 'auto', height: '100%' }}>
              <ConsentView onDisagree={handleDisagree} onAgree={handleAgree} />
            </div>
          )}

          {accept && !isAuth && (
            <div style={{ overflowY: 'auto', height: '100%' }}>
              <LoginView onLogin={onLogin} onSignUp={handleSignUp} />
            </div>
          )}
        </div>
      )}

      {/* SignUp popup - only available when activated */}
      {isActivated && <SignUpPopup isOpen={showSignUp} setIsOpen={setShowSignUp} />}
    </>
  );
}
