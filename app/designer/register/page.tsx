"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/designer-applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({})); setLoading(false);
    if (!res.ok) { setError(data.error ?? "Could not submit application."); return; }
    setDone(true); router.refresh();
  }
  return <main className="page"><div className="container" style={{ maxWidth: 760 }}><div className="panel"><div className="eyebrow">For professionals</div><h1 style={{ fontSize: 44 }}>Join Nestora</h1><p className="lead" style={{ fontSize: 16 }}>Submit your professional profile for admin review. Only approved profiles appear in the directory.</p>
  {done ? <div className="notice">Your application was saved and is pending review. You can continue using your account while we review it.</div> : <form onSubmit={submit}><div className="form-grid"><div><label htmlFor="studioName">Studio / Designer name</label><input id="studioName" name="studioName" required minLength={2} maxLength={100} placeholder="Studio name" /></div><div><label htmlFor="city">City</label><input id="city" name="city" required minLength={2} maxLength={60} placeholder="Pune" /></div><div><label htmlFor="experienceYr">Years of experience</label><input id="experienceYr" name="experienceYr" type="number" min="0" max="60" required /></div><div><label htmlFor="specialty">Specialization</label><input id="specialty" name="specialty" maxLength={100} placeholder="Residential interiors, kitchens..." /></div><div className="form-full"><label htmlFor="bio">Portfolio description</label><textarea id="bio" name="bio" rows={5} maxLength={2000} required minLength={20} placeholder="Describe your experience and design approach." /></div></div>{error && <p role="alert" style={{ color: "#b00", marginTop: 12 }}>{error}</p>}<button type="submit" className="btn btn-accent" disabled={loading} style={{ marginTop: 18 }}>{loading ? "Submitting…" : "Submit application"}</button></form>}</div></div></main>;
}
