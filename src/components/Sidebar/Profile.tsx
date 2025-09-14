import {useUserState, useUserDispatch} from "../../store/UserContext";
import {useState, useRef, useEffect} from "react";
import PasswordResetPopup from "./PasswordResetPopup";
export function ProfileMenu() {
  const user = useUserState();

  const userDispatch = useUserDispatch();
  const initial =
    user.user?.firstName.substring(0, 1) +
    " " +
    user.user?.lastName.substring(0, 1);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      // Add event listener with a small delay
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div>
        <button
          type="button"
          onClick={toggleMenu}
          className="relative inline-flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-500 rounded-full dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200 cursor-pointer"
        >
          <span className="text-white font-medium">{initial}</span>
        </button>
      </div>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" style={{ zIndex: 50 }}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              type="button"
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors duration-150 cursor-pointer"
              onClick={() => {
                setMenuOpen(false);
                setIsPasswordResetOpen(true);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              Reset Password
            </button>
            <button
              type="button"
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors duration-150 cursor-pointer"
              onClick={() => {
                setMenuOpen(false);
                userDispatch({type: "LOGOUT"});
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              Logout
            </button>
          </div>
        </div>
      )}
      
      <PasswordResetPopup
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
      />
    </div>
  );
}
