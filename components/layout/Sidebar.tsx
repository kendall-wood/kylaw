"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Home, FileText, BookOpen, BarChart2,
  Layers, Zap, Shuffle, ChevronDown, LogIn, UserPlus,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/test", label: "Practice", icon: FileText },
  {
    href: "/study", label: "Study", icon: BookOpen,
    children: [
      { href: "/study/flashcards", label: "Flashcards", icon: Layers },
      { href: "/study/drills", label: "Drills", icon: Zap },
      { href: "/study/matching", label: "Matching", icon: Shuffle },
    ],
  },
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
];

const ICON_SIZE = 18;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [locked, setLocked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = locked || hovered;

  useEffect(() => {
    setMounted(true);
    const savedLocked = localStorage.getItem("kylaw_sidebar_locked") === "true";
    setLocked(savedLocked);
    // auto-open study submenu if on study page
    if (pathname.startsWith("/study")) setStudyOpen(true);
  }, [pathname]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("kylaw_sidebar_locked", String(locked));
    document.documentElement.style.setProperty(
      "--sidebar-current-width", locked ? "224px" : "60px"
    );
  }, [locked, mounted]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-current-width", "60px"
    );
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimer.current = setTimeout(() => setHovered(false), 120);
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const W = open ? "224px" : "60px";

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: W,
        background: "#fff",
        borderRight: "1px solid #EAEEF4",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        fontFamily: "var(--font-sans)",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        boxShadow: open ? "4px 0 24px rgba(0,0,0,0.05)" : "none",
      }}
    >
      {/* Brand */}
      <div style={{
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: open ? "space-between" : "center",
        padding: open ? "0 16px 0 18px" : "0",
        borderBottom: "1px solid #EAEEF4",
        flexShrink: 0,
      }}>
        {open && (
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              fontWeight: "400",
              color: "#1B4FD8",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}>KyLaw</span>
            <span style={{ fontSize: "10px", color: "#9BA8BB", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              LSAT
            </span>
          </Link>
        )}
        {!open && (
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "16px", color: "#1B4FD8" }}>K</span>
        )}
        {open && (
          <button
            onClick={() => setLocked((l) => !l)}
            title={locked ? "Auto-hide" : "Keep open"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9BA8BB",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#1B4FD8";
              (e.currentTarget as HTMLElement).style.background = "#EBF0FF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#9BA8BB";
              (e.currentTarget as HTMLElement).style.background = "none";
            }}
          >
            {locked
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            }
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          const childActive = item.children?.some((c) => isActive(c.href));
          const highlighted = active && !item.children || childActive;
          const Icon = item.icon;

          return (
            <div key={item.href} style={{ marginBottom: "2px" }}>
              <div
                title={!open ? item.label : undefined}
                onClick={() => {
                  if (item.children) {
                    if (!open) {
                      setLocked(true);
                      setStudyOpen(true);
                    } else {
                      setStudyOpen((o) => !o);
                    }
                  } else {
                    router.push(item.href);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: open ? "9px 12px" : "9px 0",
                  justifyContent: open ? "flex-start" : "center",
                  borderRadius: "8px",
                  background: highlighted ? "#EBF0FF" : "transparent",
                  color: highlighted ? "#1B4FD8" : "#64748B",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  if (!highlighted) {
                    (e.currentTarget as HTMLElement).style.background = "#F5F7FA";
                    (e.currentTarget as HTMLElement).style.color = "#1E293B";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent";
                  } else {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(27,79,216,0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!highlighted) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#64748B";
                  }
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent";
                }}
              >
                <Icon size={ICON_SIZE} strokeWidth={highlighted ? 2 : 1.6} style={{ flexShrink: 0 }} />
                {open && (
                  <>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: highlighted ? "600" : "400",
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}>
                      {item.label}
                    </span>
                    {item.children && (
                      <ChevronDown
                        size={14}
                        style={{
                          opacity: 0.4,
                          transform: studyOpen ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Children */}
              {item.children && open && studyOpen && (
                <div style={{
                  marginLeft: "18px",
                  paddingLeft: "12px",
                  borderLeft: "1px solid #EAEEF4",
                  marginTop: "2px",
                  marginBottom: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                }}>
                  {item.children.map((child) => {
                    const ca = isActive(child.href);
                    const CIcon = child.icon;
                    return (
                      <Link key={child.href} href={child.href} style={{ textDecoration: "none" }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "7px 10px",
                          borderRadius: "7px",
                          fontSize: "13px",
                          fontWeight: ca ? "600" : "400",
                          color: ca ? "#1B4FD8" : "#64748B",
                          background: ca ? "#EBF0FF" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!ca) {
                            (e.currentTarget as HTMLElement).style.background = "#F5F7FA";
                            (e.currentTarget as HTMLElement).style.color = "#1E293B";
                          } else {
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(27,79,216,0.12)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!ca) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#64748B";
                          }
                          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent";
                        }}
                        >
                          <CIcon size={14} strokeWidth={ca ? 2 : 1.6} />
                          <span>{child.label}</span>
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
        padding: "10px 8px 16px",
        borderTop: "1px solid #EAEEF4",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}>
        {open ? (
          <>
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "8px",
                fontSize: "14px", color: "#64748B", cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F7FA"; (e.currentTarget as HTMLElement).style.color = "#1E293B"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}
              >
                <LogIn size={ICON_SIZE} strokeWidth={1.6} />
                <span>Sign in</span>
              </div>
            </Link>
            <Link href="/auth/signup" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "8px",
                fontSize: "14px", fontWeight: "600", color: "#fff",
                background: "#1B4FD8", cursor: "pointer",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1740C0";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(27,79,216,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1B4FD8";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
              >
                <UserPlus size={ICON_SIZE} strokeWidth={1.6} />
                <span>Sign up</span>
              </div>
            </Link>
          </>
        ) : (
          <div
            title="Sign in"
            style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}
          >
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#64748B", cursor: "pointer",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#F5F7FA";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(27,79,216,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
              >
                <LogIn size={16} strokeWidth={1.6} />
              </div>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
