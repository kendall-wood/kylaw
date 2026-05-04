"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const FULLSCREEN_ROUTES = ["/test/session", "/test/review"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some((r) => pathname.startsWith(r));

  if (isFullscreen) return <>{children}</>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: "var(--sidebar-current-width, 224px)",
        minHeight: "100vh",
        transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {children}
      </main>
    </div>
  );
}
