"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/", label: "Home", icon: "○", exact: true },
  { href: "/test", label: "Practice", icon: "◻" },
  {
    href: "/study", label: "Study", icon: "◈",
    children: [
      { href: "/study/flashcards", label: "Flashcards" },
      { href: "/study/drills", label: "Drills" },
      { href: "/study/matching", label: "Matching" },
    ],
  },
  { href: "/dashboard", label: "Dashboard", icon: "◇" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [studyOpen, setStudyOpen] = useState(pathname.startsWith("/study"));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("kylaw_sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("kylaw_sidebar_collapsed", String(collapsed));
    document.documentElement.style.setProperty(
      "--sidebar-current-width",
      collapsed ? "60px" : "224px"
    );
  }, [collapsed, mounted]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-current-width",
      collapsed ? "60px" : "224px"
    );
  }, []);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const W = collapsed ? "60px" : "224px";

  return (
    <aside className={collapsed ? "sidebar-collapsed" : ""} style={{
      position: "fixed",
      top: 0, left: 0, bottom: 0,
      width: W,
      background: "#fff",
      borderRight: "1px solid var(--color-border)",
      display: "flex",
      flexDirection: "column",
      zIndex: 50,
      fontFamily: "var(--font-sans)",
      transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      overflow: "hidden",
    }}>

      {/* Brand + toggle */}
      <div style={{
        padding: collapsed ? "20px 0" : "24px 20px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        minHeight: "64px",
        borderBottom: "1px solid var(--color-border)",
      }}>
        {!collapsed && (
          <Link href="/" style={{ textDecoration: "none" }}>
            <div>
              <span style={{
                fontFamily: "var(--font-serif)",
                fontSize: "22px",
                fontWeight: "400",
                color: "var(--color-accent)",
                letterSpacing: "-0.01em",
                display: "block",
                lineHeight: 1,
              }}>KyLaw</span>
              <span style={{ fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                LSAT 2026
              </span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            fontSize: "12px",
            flexShrink: 0,
            transition: "background var(--t), color var(--t)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-accent-light)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
          }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto", overflowX: "hidden" }}>
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          const childActive = item.children?.some((c) => pathname.startsWith(c.href));
          const highlighted = (active && !item.children) || childActive;

          return (
            <div key={item.href}>
              {/* Main item */}
              <div
                className="sidebar-tooltip"
                data-tip={item.label}
                onClick={() => {
                  if (item.children) {
                    if (!collapsed) setStudyOpen((o) => !o);
                  }
                }}
                style={{ position: "relative" }}
              >
                <Link
                  href={item.children ? "#" : item.href}
                  onClick={item.children ? (e) => e.preventDefault() : undefined}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: collapsed ? "10px 0" : "9px 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "9px",
                    background: highlighted
                      ? "var(--color-accent-light)"
                      : "transparent",
                    color: highlighted ? "var(--color-accent)" : "var(--color-text-secondary)",
                    cursor: "pointer",
                    transition: "background var(--t), color var(--t), box-shadow var(--t)",
                    position: "relative",
                    boxShadow: highlighted ? "inset 3px 0 0 var(--color-accent)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!highlighted) {
                      (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!highlighted) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
                    }
                  }}
                  >
                    <span style={{ fontSize: "15px", flexShrink: 0, width: "20px", textAlign: "center" }}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span style={{
                          fontSize: "14px",
                          fontWeight: highlighted ? "600" : "400",
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          transition: "opacity 0.15s",
                        }}>
                          {item.label}
                        </span>
                        {item.children && (
                          <span style={{
                            fontSize: "9px",
                            opacity: 0.5,
                            transform: studyOpen ? "rotate(90deg)" : "none",
                            transition: "transform 0.2s",
                            display: "inline-block",
                          }}>▶</span>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              </div>

              {/* Children (only when expanded) */}
              {item.children && !collapsed && studyOpen && (
                <div style={{
                  marginLeft: "30px",
                  marginTop: "2px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                  borderLeft: "1px solid var(--color-border)",
                  paddingLeft: "10px",
                }}>
                  {item.children.map((child) => {
                    const ca = pathname.startsWith(child.href);
                    return (
                      <Link key={child.href} href={child.href} style={{ textDecoration: "none" }}>
                        <div style={{
                          padding: "7px 10px",
                          borderRadius: "7px",
                          fontSize: "13px",
                          fontWeight: ca ? "600" : "400",
                          color: ca ? "var(--color-accent)" : "var(--color-text-muted)",
                          background: ca ? "var(--color-accent-light)" : "transparent",
                          transition: "background var(--t), color var(--t)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          if (!ca) {
                            (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!ca) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                          }
                        }}
                        >
                          {child.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Auth */}
      <div style={{
        padding: collapsed ? "12px 8px" : "12px 8px 20px",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}>
        {collapsed ? (
          <div className="sidebar-tooltip" data-tip="Sign in" style={{ display: "flex", justifyContent: "center" }}>
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "8px",
                background: "var(--color-surface)", border: "1px solid var(--color-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", cursor: "pointer", color: "var(--color-text-secondary)",
                transition: "background var(--t)",
              }}>→</div>
            </Link>
          </div>
        ) : (
          <>
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
                color: "var(--color-text-secondary)", cursor: "pointer",
                transition: "background var(--t)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Sign in
              </div>
            </Link>
            <Link href="/auth/signup" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
                fontWeight: "600", color: "#fff",
                background: "linear-gradient(135deg, #1B4FD8, #4F46E5)",
                textAlign: "center", cursor: "pointer",
                transition: "opacity var(--t), box-shadow var(--t)",
                boxShadow: "0 2px 8px rgba(27,79,216,0.25)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.9";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(27,79,216,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(27,79,216,0.25)";
              }}
              >
                Sign up free
              </div>
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
