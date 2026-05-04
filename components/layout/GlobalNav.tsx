"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      style={{
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
        fontFamily: "var(--font-sans)",
      }}
      className="sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-serif-display)",
            color: "var(--color-accent)",
            fontSize: "22px",
            textDecoration: "none",
          }}
        >
          KyLaw
        </Link>

        <div className="flex items-center gap-8">
          <NavLink href="/test" label="Practice" active={isActive("/test")} />
          <NavLink href="/study" label="Study" active={isActive("/study")} />
          <NavLink
            href="/dashboard"
            label="Dashboard"
            active={isActive("/dashboard")}
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
              fontSize: "14px",
              padding: "7px 16px",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            Sign up free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
        fontSize: "14px",
        fontWeight: active ? "600" : "400",
        textDecoration: "none",
        borderBottom: active
          ? "2px solid var(--color-accent)"
          : "2px solid transparent",
        paddingBottom: "2px",
      }}
    >
      {label}
    </Link>
  );
}
