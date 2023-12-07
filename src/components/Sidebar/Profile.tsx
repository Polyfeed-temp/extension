import {useUserState, useUserDispatch} from "../../store/UserContext";
import {useState} from "react";
export function ProfileMenu() {
  const user = useUserState();
  const userDispatch = useUserDispatch();
  const initial =
    user.user?.firstName.substring(0, 1) +
    " " +
    user.user?.lastName.substring(0, 1);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };
  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={toggleMenu}
          className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-500 rounded-full dark:bg-gray-600"
        >
          <span>{initial}</span>
        </button>
      </div>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {/* Other profile options */}
            {/* <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              Your Profile
            </a> */}
            {/* Other profile options */}

            {/* Logout option */}
            <button
              onClick={() => {
                toggleMenu(); // Close the menu when Logout is clicked
                userDispatch({type: "LOGOUT"});
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              Logout
            </button>
            {/* Logout option */}
          </div>
        </div>
      )}
    </div>
  );
}
