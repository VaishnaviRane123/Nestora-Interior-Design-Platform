// app/login/page.tsx
"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    const requested = new URLSearchParams(window.location.search).get("callbackUrl");
    const destination = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
    router.push(destination);
    router.refresh();
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="panel">
          <div className="eyebrow">Welcome back</div>
          <h1 style={{ fontSize: 42 }}>Sign in</h1>

          <form onSubmit={onSubmit}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div style={{ height: 14 }} />
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            {error && (
              <p style={{ color: "#b00", marginTop: 12, fontSize: 14 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-dark"
              disabled={loading}
              style={{ width: "100%", marginTop: 20 }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="muted center" style={{ fontSize: 13 }}>
            No account? <Link href="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
