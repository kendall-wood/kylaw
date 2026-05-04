"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", padding: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid var(--color-border)", padding: "48px 40px", maxWidth: "420px", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✉️</div>
          <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "26px", fontWeight: "400", marginBottom: "10px" }}>Check your email</h2>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: "1.6", marginBottom: "28px" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/auth/login" style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "var(--color-accent)",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            textDecoration: "none",
          }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

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
            Create your account
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Track scores, flashcard progress, and weak areas</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "6px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--color-border)", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", outline: "none", background: "#fff" }}
              onFocus={(e) => e.target.style.borderColor = "var(--color-accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "6px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 characters"
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--color-border)", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", outline: "none", background: "#fff" }}
              onFocus={(e) => e.target.style.borderColor = "var(--color-accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "6px" }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter password"
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--color-border)", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", outline: "none", background: "#fff" }}
              onFocus={(e) => e.target.style.borderColor = "var(--color-accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "var(--color-incorrect-bg)", border: "1px solid var(--color-incorrect)", borderRadius: "7px", fontSize: "13px", color: "var(--color-incorrect)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "13px", background: loading ? "var(--color-border)" : "var(--color-accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: loading ? "default" : "pointer", marginTop: "4px", fontFamily: "var(--font-sans)" }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "24px" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--color-accent)", fontWeight: "600", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
