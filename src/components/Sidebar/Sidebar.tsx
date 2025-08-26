import React, { useState } from 'react';
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
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
  onLogin: () => void;
  isAuth: boolean;
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
    <div
      className="fixed top-0 right-0 h-full border-solid border-4 border-sky-500"
      style={{
        width: collapsed ? '0' : '428px',
        transition: 'width 0.3s',
        zIndex: 9999,
        backgroundColor: 'white',
      }}
    >
      <div
        className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 flex items-center justify-center p-2 cursor-pointer bg-white border border-gray-300"
        onClick={toggleSidebar}
      >
        {collapsed ? leftChevron : rightChevron}
        <img src={Logo} className="h-8 md:h-12" alt="Logo" />
      </div>

      {isAuth && (
        <div style={{ overflowY: 'auto', height: '100%' }}>
          <SidebarHeader></SidebarHeader>
          <SidebarPanel></SidebarPanel>
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

      <SignUpPopup isOpen={showSignUp} setIsOpen={setShowSignUp} />
    </div>
  );
}
