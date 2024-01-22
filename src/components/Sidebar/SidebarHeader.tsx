import {useState} from "react";
import LoginPopup from "./LoginPopUp";
import {useUserState} from "../../store/UserContext";
import {ProfileMenu} from "./Profile";
import SignUpPopup from "../SignUpPopUp";
import config from "../../config.json";
const Logo = require("../../assets/logo/PolyFeed_BlackText.png")
  .default as string;

export function SidebarHeader() {
  const user = useUserState();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isSignUpPopupOpen, setIsSignUpPopupOpen] = useState(false);
  return (
    <div
      id="header"
      className="flex justify-between items-center p-6 border-b border-gray-300 text-xl"
    >
      <img
        src={Logo}
        className="h-8 md:h-12"
        alt="Logo"
        onClick={() => {
          window.location.href = config.server;
        }}
        style={{cursor: "pointer"}}
      />
      {!user.login ? (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSignUpPopupOpen(true)}
            className="bg-black text-white font-light py-2 px-4 rounded hover:bg-gray-800 transition duration-300"
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsLoginPopupOpen(true)}
            className="bg-black text-white font-light py-2 px-4 rounded hover:bg-gray-800 transition duration-300"
          >
            Login
          </button>

          <LoginPopup
            isOpen={isLoginPopupOpen}
            onClose={() => setIsLoginPopupOpen(false)}
          />
          <SignUpPopup
            isOpen={isSignUpPopupOpen}
            setIsOpen={setIsSignUpPopupOpen}
          ></SignUpPopup>
        </div>
      ) : (
        <ProfileMenu></ProfileMenu>
      )}
    </div>
  );
}
