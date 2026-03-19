"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type LayoutContextType = {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const MOBILE_BREAKPOINT = 768; // adjust if needed

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // set initial + sync on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setIsSidebarCollapsed(true); // collapsed on mobile
      } else {
        setIsSidebarCollapsed(false); // expanded on desktop
      }
    };

    handleResize(); // run on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <LayoutContext.Provider value={{ isSidebarCollapsed, toggleSidebar,setSidebarCollapsed: setIsSidebarCollapsed, }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("useLayout must be used within LayoutProvider");
  return context;
};