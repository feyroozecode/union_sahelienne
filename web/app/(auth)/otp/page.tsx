"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { api, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/session";
import f from "../form.module.css";

const LEN = 6;

export default function OtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [shownCode, setShownCode] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(45);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("us_otp") : null;
    if (!raw) {
      router.replace("/inscription");
      return;
    }
    try {
      const { email: em, code } = JSON.parse(raw) as { email: string; code?: string };
      setEmail(em);
      if (code) setShownCode(code);
    } catch {
      router.replace("/inscription");
    }
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const code = digits.join("");

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    if (!clean) {
      setDigits((d) => d.map((x, j) => (j === i ? "" : x)));
      return;
    }
    const next = [...digits];
    // support paste of full code
    if (clean.length > 1) {
      clean.split("").slice(0, LEN).forEach((ch, k) => {
        if (i + k < LEN) next[i + k] = ch;
      });
      setDigits(next);
      const last = Math.min(i + clean.length, LEN - 1);
      inputs.current[last]?.focus();
      if (next.join("").length === LEN) verify(next.join(""));
      return;
    }
    next[i] = clean;
    setDigits(next);
    if (i < LEN - 1) inputs.current[i + 1]?.focus();
    if (next.join("").length === LEN) verify(next.join(""));
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function verify(value?: string) {
    const c = value ?? code;
    if (c.length < LEN || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.verifyOtp(email, c);
      saveSession(res);
      sessionStorage.removeItem("us_otp");
      router.push("/espace");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Code invalide. Réessayez.";
      setError(msg);
      setDigits(Array(LEN).fill(""));
      inputs.current[0]?.focus();
      setLoading(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setError(null);
    try {
      const res = await api.resendOtp(email);
      if (res.code) setShownCode(res.code);
      setCooldown(45);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Renvoi impossible.");
    }
  }

  const masked = email.replace(/^(.).*(@.*)$/, "$1•••$2");

  return (
    <AuthShell
      aside={{
        quote: "Encore un instant. Saisissez le code et votre profil prend vie.",
        author: "Vérification du compte",
      }}
    >
      <div className={f.head}>
        <span className={f.kicker}>Vérification</span>
        <h1 className={f.title}>Confirmez votre compte.</h1>
        <p className={f.sub}>
          Un code à 6 chiffres a été généré pour <b>{masked}</b>. Saisissez-le ci-dessous.
        </p>
      </div>

      {shownCode && (
        <div className={f.codeHint}>
          <span>Votre code de vérification</span>
          <strong>{shownCode}</strong>
        </div>
      )}

      {error && <div className={f.error} style={{ marginTop: 16 }}>{error}</div>}

      <div className={f.otpRow} style={{ marginTop: 22 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            className={f.otpBox}
            inputMode="numeric"
            maxLength={i === 0 ? LEN : 1}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            aria-label={`Chiffre ${i + 1}`}
          />
        ))}
      </div>

      <button className="btn btn--clay btn--block" style={{ marginTop: 22 }} onClick={() => verify()} disabled={loading || code.length < LEN}>
        {loading ? "Vérification…" : "Vérifier et continuer"}
      </button>

      <div className={f.resend}>
        Vous n&apos;avez pas reçu le code ?{" "}
        <button onClick={resend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : "Renvoyer le code"}
        </button>
      </div>
    </AuthShell>
  );
}
