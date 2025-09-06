import React, { useState, useEffect } from "react";
import { xMarkIcon } from "../AnnotationIcons";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/user.service";

const PasswordResetPopup = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }

    if (oldPassword === newPassword) {
      setErrorMessage("New password must be different from current password");
      return;
    }

    const status = resetPassword(oldPassword, newPassword);
    const val = toast.promise(status, {
      pending: "Resetting password...",
      success: "Password reset successfully",
      error: "Password reset failed",
    });

    try {
      await status;
      onClose();
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else {
        setErrorMessage("Failed to reset password. Please try again.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      id="password-reset-modal"
      style={{ zIndex: 10010 }}
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" style={{ zIndex: 10011 }}>
        <button onClick={onClose} className="absolute top-0 right-0 mt-3 mr-3">
          {xMarkIcon}
        </button>
        <form onSubmit={handleSubmit}>
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Reset Password
            </h3>
            <div className="mt-2 px-7 py-3">
              <input
                type="password"
                className="mb-3 px-3 py-2 border rounded-md w-full text-black bg-white"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current Password"
                required
              />
              <input
                type="password"
                className="mb-3 px-3 py-2 border rounded-md w-full text-black bg-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                required
              />
              <input
                type="password"
                className="px-3 py-2 border rounded-md w-full text-black bg-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                required
              />
            </div>
          </div>
          {errorMessage && (
            <div className="text-red-500 text-center px-4">{errorMessage}</div>
          )}
          <div className="items-center px-4 py-3">
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetPopup;