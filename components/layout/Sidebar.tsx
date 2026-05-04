"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  children?: { href: string; label: string }[];
}

const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "○" },
  { href: "/test", label: "Practice", icon: "◻" },
  {
    href: "/study",
    label: "Study",
    icon: "◈",
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
  const [studyOpen, setStudyOpen] = useState(
    pathname.startsWith("/study")
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside style={{
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      width: "224px",
      background: "#fff",
      borderRight: "1px solid var(--color-border)",
      display: "flex",
      flexDirection: "column",
      zIndex: 50,
      fontFamily: "var(--font-sans)",
    }}>

      {/* Brand */}
      <div style={{ padding: "28px 24px 20px" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: "24px",
            fontWeight: "400",
            color: "var(--color-accent)",
            letterSpacing: "-0.01em",
          }}>
            KyLaw
          </span>
        </Link>
        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px", letterSpacing: "0.05em" }}>
          LSAT 2026
        </p>
      </div>

      <div style={{ height: "1px", background: "var(--color-border)", margin: "0 16px" }} />

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV.map((item) => {
          const active = isActive(item.href);
          const hasChildren = !!item.children;
          const childActive = item.children?.some((c) => pathname.startsWith(c.href));

          return (
            <div key={item.href}>
              <button
                onClick={() => {
                  if (hasChildren) setStudyOpen((o) => !o);
                }}
                style={{ width: "100%", background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                <Link
                  href={hasChildren ? "#" : item.href}
                  onClick={hasChildren ? (e) => { e.preventDefault(); setStudyOpen((o) => !o); } : undefined}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    background: (active && !hasChildren) || childActive ? "var(--color-accent-light)" : "transparent",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!(active && !hasChildren) && !childActive)
                      (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                  }}
                  onMouseLeave={(e) => {
                    if (!(active && !hasChildren) && !childActive)
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                  >
                    <span style={{
                      fontSize: "14px",
                      color: (active && !hasChildren) || childActive ? "var(--color-accent)" : "var(--color-text-muted)",
                      width: "16px",
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </span>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: (active && !hasChildren) || childActive ? "600" : "400",
                      color: (active && !hasChildren) || childActive ? "var(--color-accent)" : "var(--color-text-primary)",
                      flex: 1,
                      textAlign: "left",
                    }}>
                      {item.label}
                    </span>
                    {hasChildren && (
                      <span style={{
                        fontSize: "10px",
                        color: "var(--color-text-muted)",
                        transform: studyOpen ? "rotate(90deg)" : "none",
                        transition: "transform 0.2s",
                        display: "inline-block",
                      }}>
                        ▶
                      </span>
                    )}
                  </div>
                </Link>
              </button>

              {/* Children */}
              {hasChildren && studyOpen && (
                <div style={{ marginLeft: "26px", marginTop: "2px", display: "flex", flexDirection: "column", gap: "1px" }}>
                  {item.children!.map((child) => {
                    const childIsActive = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        style={{ textDecoration: "none" }}
                      >
                        <div style={{
                          padding: "7px 12px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: childIsActive ? "600" : "400",
                          color: childIsActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                          background: childIsActive ? "var(--color-accent-light)" : "transparent",
                          transition: "background 0.15s, color 0.15s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (!childIsActive) {
                            (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!childIsActive) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
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

      {/* Bottom auth */}
      <div style={{ padding: "16px 12px 24px", borderTop: "1px solid var(--color-border)" }}>
        <Link href="/auth/login" style={{ textDecoration: "none" }}>
          <div style={{
            padding: "9px 12px",
            borderRadius: "8px",
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            transition: "background 0.15s",
            marginBottom: "6px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Sign in
          </div>
        </Link>
        <Link href="/auth/signup" style={{ textDecoration: "none" }}>
          <div style={{
            padding: "9px 12px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#fff",
            background: "var(--color-accent)",
            textAlign: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-accent)")}
          >
            Sign up free
          </div>
        </Link>
      </div>
    </aside>
  );
}
