import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getChromeLocalStorage,
  setChromeLocalStorage,
} from "../services/localStorage";

// Define the key used in localStorage
const CONSENT_STORAGE_KEY = "consent-storage";

interface ConsentContextValue {
  accept: boolean;
  hideLogo: boolean;
  collapsed: boolean;
  token: string | null;
  setAccept: (accept: boolean) => void;
  setHideLogo: (hideLogo: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  handleDisagree: () => void;
  handleAgree: () => void;
  setTokenFromBrowser: (token: string) => void;
  tokenFromBrowser: string;
}

// Create a context for the consent state
const ConsentContext = createContext<ConsentContextValue | undefined>(
  undefined
);

// Helper function to get data from localStorage
const getStoredConsent = async () => {
  const storedData = (await getChromeLocalStorage(
    CONSENT_STORAGE_KEY
  )) as string;

  return storedData
    ? JSON.parse(storedData)
    : { accept: false, hideLogo: false, collapsed: true, token: null };
};

// Helper function to set data in localStorage
const setStoredConsent = (data: Partial<ConsentContextValue>) => {
  getStoredConsent().then((storedData) => {
    const updatedData = { ...storedData, ...data };
    setChromeLocalStorage({
      key: CONSENT_STORAGE_KEY,
      value: JSON.stringify(updatedData),
    });
  });
};

// Create a provider component to wrap your app
export const ConsentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [accept, setAccept] = useState(false);
  const [hideLogo, setHideLogo] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenFromBrowser, setFirebaseToken] = useState<string>("");

  useEffect(() => {
    const initializeConsentData = async () => {
      const storedConsent = await getStoredConsent();

      // Conditionally update state if the stored values are not null or false
      if (storedConsent.accept) setAccept(storedConsent.accept);
      if (storedConsent.hideLogo) setHideLogo(storedConsent.hideLogo);
      if (storedConsent.collapsed) setCollapsed(storedConsent.collapsed);
      if (storedConsent.token) setToken(storedConsent.token);
    };

    initializeConsentData();
  }, []);

  const handleDisagree = () => {
    toast("See you next time");
    setHideLogo(true);
    setCollapsed(false);
    setStoredConsent({ hideLogo: true, collapsed: false });
  };

  const handleAgree = () => {
    setAccept(true);
    setStoredConsent({ accept: true });
  };

  const setTokenFromBrowser = (token: string) => {
    setFirebaseToken(token);
    setStoredConsent({ token });
  };

  return (
    <ConsentContext.Provider
      value={{
        accept,
        hideLogo,
        collapsed,
        token,
        setAccept,
        setHideLogo,
        setCollapsed,
        handleDisagree,
        handleAgree,
        setTokenFromBrowser,
        tokenFromBrowser,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

// Custom hook to access the consent context
export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
};
