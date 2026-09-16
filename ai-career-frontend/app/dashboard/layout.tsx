import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <div className="ml-64 min-h-screen">

        <Header />

        <main className="p-5 md:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}