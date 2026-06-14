"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { api, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/session";
import f from "../form.module.css";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Adresse e-mail invalide.");
    if (!password) return setError("Saisissez votre mot de passe.");
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      saveSession(res);
      router.push("/espace");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Connexion impossible. Réessayez.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      aside={{
        quote: "Le chemin vers une union sincère vous attend. Reprenez là où vous en étiez.",
        author: "Union Sahélienne",
      }}
    >
      <div className={f.head}>
        <span className={f.kicker}>Bon retour</span>
        <h1 className={f.title}>Se connecter.</h1>
        <p className={f.sub}>Accédez à votre espace et à vos rencontres.</p>
      </div>

      {error && <div className={f.error}>{error}</div>}

      <form className={f.form} onSubmit={submit} style={{ marginTop: error ? 16 : 0 }}>
        <div className="field">
          <label htmlFor="em">Adresse e-mail</label>
          <input id="em" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="pw">Mot de passe</label>
          <input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn--clay btn--block" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className={f.alt}>
        Pas encore de compte ? <Link href="/inscription">Créer mon profil</Link>
      </p>
    </AuthShell>
  );
}
