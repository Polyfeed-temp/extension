import React from "react";
const Logo = require("../../assets/logo/PolyFeed_BlackText.png")
  .default as string;

interface ConsentViewProps {
  onAgree: () => void;
  onDisagree: () => void;
}

export const ConsentView: React.FC<ConsentViewProps> = ({
  onAgree,
  onDisagree,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 20,
      }}
    >
      <img src={Logo} style={{ height: "auto", width: "50%" }} alt="Logo" />
      <p style={{ marginTop: "8px", fontSize: "24px", fontWeight: "bold" }}>
        Welcome to PolyFeed
      </p>
      <p style={{ color: "#9CA3AF" }}>
        PolyFeed enhances your feedback by analyzing and improving your written
        feedback through artificial intelligence (AI) and tracking student
        interactions with feedback.
      </p>
      <p style={{ color: "#9CA3AF" }}>
        To learn more about the data we collect and how we ensure your privacy,
        please read our{" "}
        <a
          target="_blank"
          href="https://www.polyfeed.com.au/privacypolicy"
          style={{ color: "#1D4ED8" }}
        >
          Privacy Policy
        </a>
        .
      </p>
      <p style={{ color: "#9CA3AF" }}>
        Your data helps us understand how teachers interact with feedback, which
        in turn facilitates more effective use by students. Any use of your data
        in research will strictly adhere to anonymity principles.
      </p>
      <p style={{ marginTop: "8px" }}>
        I consent to the use of my anonymized data in future research.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "16px",
          width: "100%",
        }}
      >
        <button
          onClick={onDisagree}
          style={{
            backgroundColor: "#DC2626",
            flex: 1,
            color: "white",
            borderRadius: "8px",
            padding: "10px 16px",
            marginRight: "16px",
            textAlign: "center",
          }}
        >
          Disagree
        </button>
        <button
          onClick={onAgree}
          style={{
            backgroundColor: "black",
            flex: 1,
            color: "white",
            borderRadius: "8px",
            padding: "10px 16px",
            textAlign: "center",
          }}
        >
          Agree
        </button>
      </div>
    </div>
  );
};
