import {useState} from "react";
import LoginPopup from "./LoginPopUp";
import {useUserState} from "../../store/UserContext";
import {ProfileMenu} from "./Profile";
const Logo = require("../../assets/logo/PolyFeed_BlackText.png")
  .default as string;

export function SidebarHeader() {
  const user = useUserState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  return (
    <div
      id="header"
      className="flex justify-between items-center p-6 border-b border-gray-300 text-xl"
    >
      <img src={Logo} className="h-8 md:h-12" alt="Logo" />
      {!user.login ? (
        <div className="flex items-center">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="bg-black text-white font-light py-2 px-4 rounded hover:bg-gray-800 transition duration-300"
          >
            Login
          </button>
          <LoginPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
          />
        </div>
      ) : (
        <ProfileMenu></ProfileMenu>
      )}
    </div>
  );
}
