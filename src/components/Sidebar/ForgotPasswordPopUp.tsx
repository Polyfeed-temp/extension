import React, { useState } from "react";
import { xMarkIcon } from "../AnnotationIcons";

const LogoWithName = require('../../assets/logo/PolyFeed_BlackText.png')
  .default as string;

const ForgotPasswordPopup = ({
  isOpen,
  onClose,
  onGoToSignUp,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGoToSignUp?: () => void;
}) => {

  if (!isOpen) {
    return null;
  }


  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      id="forgot-password-modal"
      style={{ zIndex: 10000 }}
    >
      <div className="relative top-10 mx-auto p-6 border max-w-lg shadow-lg rounded-md bg-white" style={{ zIndex: 10001 }}>
        <button onClick={onClose} className="absolute top-0 right-0 mt-3 mr-3">
          {xMarkIcon}
        </button>
        
        <div className="text-center">
          <img
            src={LogoWithName}
            className="h-12 mx-auto mb-6"
            alt="PolyFeed Logo"
          />
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Forgot Password?
          </h2>
          
          <p className="text-gray-500 text-sm mb-6">
            No worries, we'll help you reset it
          </p>
          

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-3">
              Password Reset Process
            </h3>
            <div className="text-left text-sm text-gray-700 space-y-3">
              <p>To reset your password, please follow these steps:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Send an email to <strong>polyfeed@gmail.com</strong> requesting a password reset for your account</li>
                <li>Wait for our response confirming your reset request has been processed</li>
                <li>Use the "Go to Registration" button below to register again with your same email and create a new password</li>
                <li>Don't worry: Re-registering will not create a new account - your existing account will be updated with your new password</li>
              </ol>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 text-center">
              📧 Please send an email to <strong className="text-gray-900">polyfeed@gmail.com</strong> with your password reset request.
            </p>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            After receiving confirmation from us:
          </p>
          
          <button
            onClick={() => {
              if (onGoToSignUp) {
                onClose();
                onGoToSignUp();
              }
            }}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md w-full mb-4 hover:bg-gray-50"
          >
            Go to Registration (Won't create new account)
          </button>
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center mx-auto"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPopup;