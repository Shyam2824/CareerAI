"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface ResumeContextType {
  refreshTrigger: number;
  refreshResumes: () => void;
}

const ResumeContext = createContext<
  ResumeContextType | undefined
>(undefined);

export function ResumeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [refreshTrigger, setRefreshTrigger] =
    useState(0);

  const refreshResumes = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ResumeContext.Provider
      value={{
        refreshTrigger,
        refreshResumes,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);

  if (!context) {
    throw new Error(
      "useResume must be used inside ResumeProvider"
    );
  }

  return context;
}