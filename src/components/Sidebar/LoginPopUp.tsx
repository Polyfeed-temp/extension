import React, {useState} from "react";
import {useUserState, useUserDispatch} from "../../store/UserContext";
const xMarkIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const LoginPopup = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const userState = useUserState();
  const dispatch = useUserDispatch();
  if (!isOpen) {
    return null;
  }
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    console.log("submit form");

    dispatch({type: "LOGIN", payload: {username, password}});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      id="my-modal"
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <button onClick={onClose} className="absolute top-0 right-0 mt-3 mr-3">
          {xMarkIcon}
        </button>
        <form onSubmit={handleSubmit}>
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Login
            </h3>
            <div className="mt-2 px-7 py-3">
              <input
                type="text"
                className="mb-3 px-3 py-2 border rounded-md w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
              <input
                type="password"
                className="px-3 py-2 border rounded-md w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          </div>

          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Login
            </button>
          </div>
        </form>
        <div className="items-center px-4 py-3"></div>
      </div>
    </div>
  );
};

export default LoginPopup;
