'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleSidebar = useCallback(() => {
    console.log('📱 [SidebarProvider] toggleSidebar called');
    setIsCollapsed((prev) => !prev);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    isCollapsed,
    setIsCollapsed,
    toggleSidebar
  }), [isCollapsed, toggleSidebar]);

  console.log('🔁 [SidebarProvider] Rendering with isCollapsed:', isCollapsed);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
