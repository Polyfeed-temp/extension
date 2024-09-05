import SidebarPanel from "./SidebarContent";

import { SidebarHeader } from "./SidebarHeader";
const Logo = require("../../assets/logo/PolyFeed_Social_White.png")
  .default as string;
import { leftChevron, rightChevron } from "../AnnotationIcons";
import { useConsent } from "../../hooks/useConsentStore";
import { LoginView } from "../Consent/LoginView";
import { ConsentView } from "../Consent/Consent";

export function Sidebar({
  collapsed,
  toggleSidebar,
  firebaseLogin,
  isAuth,
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
  firebaseLogin: (token: string) => void;
  isAuth: boolean;
}) {
  const { accept, handleDisagree, handleAgree, tokenFromBrowser } =
    useConsent();

  return (
    <div
      className="fixed top-0 right-0 h-full border-solid border-4 border-sky-500"
      style={{
        width: collapsed ? "0" : "428px",
        transition: "width 0.3s",
        zIndex: 9999,
        backgroundColor: "white",
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
        <div style={{ overflowY: "auto", height: "100%" }}>
          <SidebarHeader></SidebarHeader>
          <SidebarPanel></SidebarPanel>
        </div>
      )}

      {accept && !isAuth && (
        <img
          src={Logo}
          style={{ width: 100, margin: "20px auto", display: "block" }}
          alt="Logo"
        />
      )}

      {!accept && !isAuth && (
        <ConsentView onDisagree={handleDisagree} onAgree={handleAgree} />
      )}

      {accept && <LoginView onLogin={() => firebaseLogin(tokenFromBrowser)} />}
    </div>
  );
}
