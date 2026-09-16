"use client";

import MentorSidebar from "@/components/mentors/MentorSidebar";

export default function MentorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">

      <MentorSidebar />

      <main className="min-h-screen pl-64">
        {children}
      </main>

    </div>
  );
}