import React, {useState} from "react";
import {useUserState, useUserDispatch} from "../../store/UserContext";
import {xMarkIcon} from "../AnnotationIcons";
import {toast} from "react-toastify";
import {login} from "../../services/user.service";
import ForgotPasswordPopup from "./ForgotPasswordPopUp";
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
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const status = login(username, password);
    const val = toast.promise(status, {
      pending: "Logging in...",
      success: "Logged in successfully",
      error: "Login failed",
    });

    try {
      const user = await status;
      if (user) {
        dispatch({type: "INITIALIZE", payload: user});
        onClose();
      }
    } catch (err) {
      setErrorMessage("Username or password is incorrect");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      id="my-modal"
      style={{ zIndex: 10000 }}
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" style={{ zIndex: 10001 }}>
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
                className="mb-3 px-3 py-2 border rounded-md w-full text-black bg-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email "
              />
              <input
                type="password"
                className="px-3 py-2 border rounded-md w-full text-black bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          </div>
          {errorMessage && <div className="text-red-500">{errorMessage}</div>}
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
        <div className="items-center px-4 py-3 text-center">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Forgot Password?
          </button>
        </div>
      </div>
      <ForgotPasswordPopup
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default LoginPopup;
