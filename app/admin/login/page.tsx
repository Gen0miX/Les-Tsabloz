// app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ThemeToggle } from '@/components/theme-toggle'
import { LTLogo } from '@/components/brand'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError('Identifiants invalides')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="lt-root min-h-screen flex items-center justify-center bg-[var(--lt-bg)] p-10 relative">
      <div
        className="absolute top-0 left-0 right-0 h-[180px] border-b border-[var(--lt-line)] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent 0 14px, oklch(from var(--lt-moss) l c h / 0.08) 14px 15px)',
        }}
      />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-7">
          <div className="inline-flex text-[var(--lt-moss)] mb-4">
            <LTLogo size={32} />
          </div>
          <span className="lt-mono text-[var(--lt-moss)]">
            Espace administrateur
          </span>
          <h1 className="lt-display text-[40px] mt-2.5 text-[var(--lt-ink)]">
            Gestion
          </h1>
        </div>

        <Card className="p-8 border-[var(--lt-line)] bg-[var(--lt-surface)]">
          <CardContent className="p-0">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="lt-label">E-mail</label>
                <Input
                  type="email"
                  placeholder="admin@tsabloz.ch"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="lt-label">Mot de passe</label>
                <Input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--lt-rust)]">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="mt-1.5 bg-[var(--lt-moss)] hover:brightness-95 text-[oklch(0.98_0.01_90)]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Connexion…
                  </span>
                ) : (
                  'Accéder au tableau de bord'
                )}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-[var(--lt-line-soft)] flex items-center gap-2.5">
              <div className="w-6 h-px bg-[var(--lt-line)]" />
              <span className="lt-mono text-[10px]">
                Accès réservé aux hôtes
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-5">
          <a
            href="/"
            className="text-[13px] text-[var(--lt-ink-mute)] no-underline"
          >
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}
