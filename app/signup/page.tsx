// app/signup/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Signup failed.");
      setLoading(false);
      return;
    }

    // Auto-login after successful signup
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="panel">
          <div className="eyebrow">Get started</div>
          <h1 style={{ fontSize: 42 }}>Create an account</h1>
          <p className="muted" style={{ marginBottom: 18, fontSize: 14 }}>
            Sign up as a customer. Designers should{" "}
            <a href="/designer/register">apply here</a>.
          </p>

          <form onSubmit={onSubmit}>
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div style={{ height: 12 }} />
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <div style={{ height: 12 }} />
            <label>Password (min 8 chars)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
            <div style={{ height: 12 }} />
            <label>Phone (optional)</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div style={{ height: 12 }} />
            <label>City (optional)</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
