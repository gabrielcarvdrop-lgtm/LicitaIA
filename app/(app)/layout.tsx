import { SidebarProvider } from "@/context/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Gradient mesh background */}
      <div className="gradient-mesh" aria-hidden />
      {/* Mid-screen purple orb (additional mesh layer) */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse, rgba(99,102,241,0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden
      />

      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-4 sm:p-8">
            <div className="h-full">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
