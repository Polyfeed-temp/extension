import React, {useState} from "react";
import {User, Role, Faculty} from "../types";
import {register} from "../services/user.service";
import {toast} from "react-toastify";
import {AxiosError} from "axios";
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

const SignUpPopup = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (boolean: boolean) => void;
}) => {
  if (!isOpen) {
    return null;
  }
  const [formData, setFormData] = useState({
    email: "",
    lastName: "",
    firstName: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const handleChange = (e: {target: {name: any; value: any}}) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    setFormData(newFormData);
    
    // Clear password mismatch error when user is typing
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      if (errorMessage === "Passwords do not match") {
        setErrorMessage("");
      }
    }
    
    console.log(newFormData);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    // Clear any previous error messages
    setErrorMessage("");
    
    const user: User = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      monashObjectId: "",
      authcate: formData.email.split("@")[0],
      role: "Student" as Role,
      faculty: "Information Technology" as Faculty,
    };

    const status = register(user);

    toast.promise(status, {
      pending: "Registering user...",
      success: "User registered successfully",
      error: "Unable to register user please try again",
    });
    
    try {
      const res = await status;
      // Success - close the modal and clear form
      setIsOpen(false);
      setFormData({
        email: "",
        lastName: "",
        firstName: "",
        password: "",
        confirmPassword: "",
      });
      setErrorMessage("");
    } catch (err: any) {
      // Error - keep modal open and preserve form data
      console.log(err.code);
      if (err.response?.status === 409) {
        setErrorMessage("User already exists");
      } else {
        setErrorMessage("Unable to register user please try again");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      id="my-modal"
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-0 right-0 mt-3 mr-3"
        >
          {xMarkIcon}
        </button>
        <form onSubmit={handleSubmit}>
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Sign Up
            </h3>
            <div className="mt-2 px-7 py-3">
              <input
                type="text"
                name="firstName"
                className="mb-3 px-3 py-2 border rounded-md w-full text-black bg-white"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
              <input
                type="text"
                name="lastName"
                className="mb-3 px-3 py-2 border rounded-md w-full text-black bg-white"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
              <input
                type="email"
                name="email"
                className="mb-3 px-3 py-2 border rounded-md w-full text-black bg-white"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />

              <input
                type="password"
                name="password"
                className="mb-3 px-3 py-2 border rounded-md w-full text-black bg-white"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                className={`mb-3 px-3 py-2 border rounded-md w-full text-black bg-white ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="text-red-500 text-sm mb-3 -mt-2">
                  Passwords do not match
                </div>
              )}
            </div>
          </div>
          {errorMessage && <div className="text-red-500">{errorMessage}</div>}
          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Sign Up
            </button>
          </div>
        </form>
        <div className="items-center px-4 py-3"></div>
      </div>
    </div>
  );
};

export default SignUpPopup;
