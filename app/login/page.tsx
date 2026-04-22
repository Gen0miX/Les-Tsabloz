// app/login/page.tsx — Guest password login
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LTWordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Mot de passe incorrect.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="lt-root min-h-screen grid grid-cols-1 md:grid-cols-[1.1fr_1fr] bg-(--lt-bg)">
      {/* Left — editorial */}
      <div className="relative p-10 md:p-14 flex flex-col justify-between border-r border-(--lt-line)">
        <div className="mb-10 md:mb-0">
          <LTWordmark />
        </div>

        <div>
          <span className="lt-mono text-(--lt-moss)">✦ Accès privé</span>
          <h1
            className="lt-display mt-4 text-(--lt-ink)"
            style={{
              fontSize: "clamp(56px, 9vw, 96px)",
              lineHeight: 0.94,
              fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'WONK' 1",
            }}
          >
            Les
            <br />
            <em
              className="not-italic text-(--lt-moss)"
              style={{
                fontStyle: "italic",
                fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'WONK' 1",
              }}
            >
              Tsabloz
            </em>
          </h1>
          <p className="text-(--lt-ink-soft) mt-5 mb-5 max-w-[40ch] text-[15px] leading-relaxed">
            Un vieux mayen perché près de Vercorin, rien que pour la famille et
            les amis.
          </p>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-px bg-(--lt-moss)" />
          <span className="lt-mono">
            46°15'01.28″N · 7°30'36.31″E — 1 211 m
          </span>
        </div>
      </div>

      {/* Right — form */}
      <div className="relative p-10 md:p-14 flex flex-col justify-center bg-(--lt-surface)">
        <div className="absolute top-4 right-5">
          <ThemeToggle />
        </div>
        <div className="max-w-[380px] w-full mx-auto">
          <span className="lt-mono">01 — Entrée</span>
          <h2 className="lt-display text-[38px] mt-3 mb-1.5">Bienvenue</h2>
          <p className="text-(--lt-ink-soft) text-[14.5px] leading-relaxed mb-8">
            Saisis le mot de passe qui t'a été transmis pour accéder au
            calendrier de réservation.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="lt-label">Mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-(--lt-rust)">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="mt-1.5 bg-(--lt-moss) hover:brightness-95 text-[oklch(0.98_0.01_90)]"
            >
              {loading ? "Vérification…" : "Entrer dans le chalet →"}
            </Button>

            <div className="mt-6 pt-5 border-t border-(--lt-line) flex justify-between items-center">
              <span className="lt-mono">Pas de mot de passe ?</span>
              <a className="text-[13px] text-(--lt-moss) font-medium no-underline">
                Contacter l’hôte
              </a>
            </div>
          </form>
        </div>

        <div className="absolute bottom-6 right-7">
          <span className="lt-mono">v1 · 2026</span>
        </div>
      </div>
    </div>
  );
}
