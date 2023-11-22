import {useState} from "react";
import LoginPopup from "./LoginPopUp";
import {useUserState} from "../../store/UserContext";
import {Avatar} from "@material-tailwind/react";
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
        <Avatar
          variant="circular"
          size="sm"
          alt="tania andrew"
          className="border border-gray-900 p-0.5"
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
        />
      )}
    </div>
  );
}
