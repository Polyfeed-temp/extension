import React from "react";

const LogoWithName = require("../../assets/logo/PolyFeed_BlackText.png")
  .default as string;
const GoogleLogo = require("../../assets/logo/google.png").default as string;

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 20,
      }}
    >
      <img
        src={LogoWithName}
        style={{ height: "auto", width: "50%" }}
        alt="Logo"
      />
      <p style={{ marginTop: "16px", fontSize: "24px", fontWeight: "bold" }}>
        Welcome to PolyFeed
      </p>
      <p style={{ marginTop: "16px", color: "#9CA3AF" }}>
        PolyFeed is a feedback management system that allows you to analyze and
        improve your feedback and observe how students interact with your
        feedback.
      </p>
      <button
        onClick={onLogin}
        style={{
          backgroundColor: "black",
          color: "white",
          display: "flex",
          flexDirection: "row",
          borderRadius: "8px",
          padding: "10px 16px",
          alignItems: "center",
          marginTop: "16px",
        }}
      >
        <img
          src={GoogleLogo}
          style={{ marginRight: "16px", borderRadius: "8px" }}
          alt="Google Logo"
        />
        LOGIN WITH GOOGLE
      </button>
    </div>
  );
};
