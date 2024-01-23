import React, {createContext, useContext, useState} from "react";
type Location = "left" | "right";

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (boolean: boolean) => void;
  location: Location;
  setLocation: (newLocation: Location) => void;
};

// Create a context for the sidebar state
const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

// Create a provider component to wrap your app
export const SidebarProvider = ({children}: {children: React.ReactNode}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [location, setLocation] = useState<Location>("right");

  return (
    <SidebarContext.Provider
      value={{collapsed, setCollapsed, location, setLocation}}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to access the sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
