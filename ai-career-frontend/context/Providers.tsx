"use client";

import { ReactNode } from "react";

import { AuthProvider } from "./AuthContext";
import { ResumeProvider } from "./ResumeContext";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <ResumeProvider>
        {children}
      </ResumeProvider>
    </AuthProvider>
  );
}