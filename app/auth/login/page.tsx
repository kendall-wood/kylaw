"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-sans)",
      padding: "24px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid var(--color-border)",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "420px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "var(--font-serif-display)", fontSize: "22px", fontWeight: "400", color: "var(--color-accent)" }}>KyLaw</span>
          </Link>
          <h1 style={{ fontFamily: "var(--font-serif-display)", fontSize: "26px", fontWeight: "400", marginTop: "16px", marginBottom: "6px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Sign in to track your progress</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "15px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-text-primary)",
                outline: "none",
                background: "#fff",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--color-accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)" }}>Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "15px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-text-primary)",
                outline: "none",
                background: "#fff",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--color-accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              background: "var(--color-incorrect-bg)",
              border: "1px solid var(--color-incorrect)",
              borderRadius: "7px",
              fontSize: "13px",
              color: "var(--color-incorrect)",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "13px",
              background: loading ? "var(--color-border)" : "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "default" : "pointer",
              marginTop: "4px",
              fontFamily: "var(--font-sans)",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "24px" }}>
          Don't have an account?{" "}
          <Link href="/auth/signup" style={{ color: "var(--color-accent)", fontWeight: "600", textDecoration: "none" }}>
            Sign up
          </Link>
        </p>

        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
          <Link href="/test" style={{ fontSize: "13px", color: "var(--color-text-muted)", textDecoration: "none" }}>
            Continue without account →
          </Link>
        </div>
      </div>
    </div>
  );
}
