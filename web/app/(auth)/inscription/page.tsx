"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { api, ApiError } from "@/lib/api";
import f from "../form.module.css";

const COUNTRIES = ["Mali", "Niger", "Burkina Faso", "Tchad", "Mauritanie", "Sénégal"];

export default function InscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const [terms, setTerms] = useState(false);

  function validateStep1(): string | null {
    if (!firstName.trim() || !lastName.trim()) return "Indiquez votre prénom et votre nom.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Adresse e-mail invalide.";
    if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
    if (password !== confirm) return "Les mots de passe ne correspondent pas.";
    return null;
  }
  function validateStep2(): string | null {
    if (!gender) return "Sélectionnez votre genre.";
    const a = Number(age);
    if (!a || a < 18 || a > 99) return "Indiquez un âge valide (18 ans ou plus).";
    if (!country) return "Sélectionnez votre pays.";
    return null;
  }

  function next() {
    setError(null);
    if (step === 0) {
      const e = validateStep1();
      if (e) return setError(e);
    }
    if (step === 1) {
      const e = validateStep2();
      if (e) return setError(e);
    }
    setStep((s) => s + 1);
  }

  async function submit() {
    if (!terms) return setError("Veuillez accepter les conditions pour continuer.");
    setError(null);
    setLoading(true);
    try {
      const res = await api.register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        age: Number(age),
        profession: profession.trim() || undefined,
        country,
        city: city.trim() || undefined,
      });
      // Stash the challenge for the OTP screen (incl. beta code shown on screen).
      const code = res && typeof res === "object" && "code" in res ? (res.code ?? "") : "";
      sessionStorage.setItem("us_otp", JSON.stringify({ email: email.trim(), code }));
      router.push("/otp");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Inscription impossible. Réessayez.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      aside={{
        quote: "Chaque grande union commence par une intention sincère. Faites le premier pas.",
        author: "Union Sahélienne",
      }}
    >
      <div className={f.steps}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`${f.stepDot} ${i <= step ? f.stepActive : ""}`} />
        ))}
      </div>

      <div className={f.head}>
        <span className={f.kicker}>Créer mon profil · Étape {step + 1} / 3</span>
        <h1 className={f.title}>
          {step === 0 && "Faisons connaissance."}
          {step === 1 && "Parlez-nous de vous."}
          {step === 2 && "Dernière étape."}
        </h1>
        <p className={f.sub}>
          {step === 0 && "Vos informations de connexion, en toute sécurité."}
          {step === 1 && "Ces détails aident à vous présenter des profils compatibles."}
          {step === 2 && "Confirmez votre engagement à respecter notre cadre."}
        </p>
      </div>

      {error && <div className={f.error}>{error}</div>}

      <div className={f.form} style={{ marginTop: error ? 16 : 0 }}>
        {step === 0 && (
          <>
            <div className={f.row}>
              <div className="field">
                <label htmlFor="fn">Prénom</label>
                <input id="fn" className="input" value={firstName} onChange={(e) => setFirst(e.target.value)} placeholder="Aïssata" />
              </div>
              <div className="field">
                <label htmlFor="ln">Nom</label>
                <input id="ln" className="input" value={lastName} onChange={(e) => setLast(e.target.value)} placeholder="Diallo" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="em">Adresse e-mail</label>
              <input id="em" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="pw">Mot de passe</label>
              <input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
            </div>
            <div className="field">
              <label htmlFor="cf">Confirmer le mot de passe</label>
              <input id="cf" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="field">
              <label>Je suis</label>
              <div className={f.seg}>
                {[
                  { v: "male", l: "Un homme" },
                  { v: "female", l: "Une femme" },
                ].map((g) => (
                  <button key={g.v} type="button" className={`${f.segBtn} ${gender === g.v ? f.segActive : ""}`} onClick={() => setGender(g.v)}>
                    {g.l}
                  </button>
                ))}
              </div>
            </div>
            <div className={f.row}>
              <div className="field">
                <label htmlFor="ag">Âge</label>
                <input id="ag" type="number" min={18} max={99} className="input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="28" />
              </div>
              <div className="field">
                <label htmlFor="co">Pays</label>
                <select id="co" className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">Choisir…</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="ci">Ville</label>
              <input id="ci" className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Niamey" />
            </div>
            <div className="field">
              <label htmlFor="pr">Profession <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(facultatif)</span></label>
              <input id="pr" className="input" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Enseignante" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.5 }}>
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: "var(--clay)" }} />
              <span>
                Je m&apos;engage à respecter le cadre et les valeurs d&apos;Union Sahélienne,
                et j&apos;accepte les <a href="#" style={{ color: "var(--indigo)", fontWeight: 600 }}>conditions d&apos;utilisation</a> et la <a href="#" style={{ color: "var(--indigo)", fontWeight: 600 }}>politique de confidentialité</a>.
              </span>
            </label>
            <div className={f.notice}>
              Après validation, un code de vérification vous sera communiqué pour
              activer votre compte.
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {step > 0 && (
            <button type="button" className="btn btn--ghost" onClick={() => { setError(null); setStep((s) => s - 1); }} disabled={loading}>
              Retour
            </button>
          )}
          {step < 2 ? (
            <button type="button" className="btn btn--clay" style={{ flex: 1 }} onClick={next}>
              Continuer
            </button>
          ) : (
            <button type="button" className="btn btn--clay" style={{ flex: 1 }} onClick={submit} disabled={loading}>
              {loading ? "Création…" : "Créer mon profil"}
            </button>
          )}
        </div>
      </div>

      <p className={f.alt}>
        Vous avez déjà un compte ? <Link href="/connexion">Se connecter</Link>
      </p>
    </AuthShell>
  );
}
