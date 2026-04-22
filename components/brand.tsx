// components/brand.tsx
// Shared brand primitives: logo, wordmark, topbar
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LTLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: "block" }}
      aria-hidden
    >
      <path
        d="M12 3 L20 19 H4 Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 9 L16 19 H8 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill="none"
        opacity="0.55"
      />
      <circle cx="12" cy="21" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function LTWordmark({ subtle = false }: { subtle?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[var(--lt-moss)] flex">
        <LTLogo size={22} />
      </span>
      <div className="flex flex-col leading-none">
        <span className="lt-display text-lg text-[var(--lt-ink)]">
          Les Tsabloz
        </span>
        {!subtle && (
          <span className="lt-mono mt-[3px] text-[9px]">
            Chalet privé · Vercorin · Valais
          </span>
        )}
      </div>
    </div>
  );
}

export function TopBar({
  admin = false,
  onLogout,
}: {
  admin?: boolean;
  onLogout?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    if (onLogout) return onLogout();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between px-7 py-4 border-b border-[var(--lt-line)] bg-[var(--lt-surface)]">
      <LTWordmark subtle={admin} />
      <div className="flex items-center gap-1.5">
        {admin && <span className="lt-mono mr-3">— Espace admin</span>}
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-[var(--lt-ink-soft)]"
        >
          Déconnexion
        </Button>
      </div>
    </header>
  );
}

export function Placeholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={`lt-placeholder ${className}`}>
      <span>{label}</span>
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
  const map = {
    pending: { cls: "lt-badge-pending", label: "En attente" },
    approved: { cls: "lt-badge-approved", label: "Confirmée" },
    rejected: { cls: "lt-badge-rejected", label: "Refusée" },
  } as const;
  const { cls, label } = map[status];
  return <span className={`lt-badge ${cls}`}>{label}</span>;
}
