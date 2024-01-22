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
    role: "Student",
    password: "",
    faculty: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const handleChange = (e: {target: {name: any; value: any}}) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log(formData);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsOpen(false);
    const user: User = {
      ...formData,
      monashObjectId: "",
      authcate: formData.email.split("@")[0],
      role: formData.role as Role,
    };

    const status = register(user);

    toast.promise(status, {
      pending: "Registering user...",
      success: "User registered successfully",
      error: "Unable to register user please try again",
    });
    status
      .then((res: any) => {
        if (res.status === 409) {
          setErrorMessage("User already exists");
          setIsOpen(true);
        }
      })
      .catch((err: AxiosError) => {
        console.log(err.code);
        setErrorMessage("Unable to register user please try again");
        setIsOpen(true);
      });
  };

  const faculty: Faculty[] = [
    "Arts",
    "Art, Design and Architecture",
    "Business and Economics",
    "Education",
    "Engineering",
    "Information Technology",
    "Law",
    "Medicine, Nursing and Health Sciences",
    "Pharmacy and Pharmaceutical Sciences",
    "Science",
  ];
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
                className="mb-3 px-3 py-2 border rounded-md w-full"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
              <input
                type="text"
                name="lastName"
                className="mb-3 px-3 py-2 border rounded-md w-full"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
              <input
                type="email"
                name="email"
                className="mb-3 px-3 py-2 border rounded-md w-full"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />

              <input
                type="password"
                name="password"
                className="mb-3 px-3 py-2 border rounded-md w-full"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              <label className="block text-sm font-medium text-gray-700 text-left">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mb-3 px-3 py-2 border rounded-md w-full"
                required
              >
                <option value="Student">Student</option>
                <option value="Tutor">Tutor</option>
                <option value="CE">CE</option>
              </select>
              <label className="block text-sm font-medium text-gray-700 text-left">
                Faculty
              </label>
              <select
                name="faculty"
                className="mb-3 px-3 py-2 border rounded-md w-full"
                onChange={handleChange}
                placeholder="Select Faculty"
                required
              >
                <option value="" disabled selected>
                  Select your faculty
                </option>
                {faculty.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
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
