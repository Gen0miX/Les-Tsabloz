// components/image-viewer.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ViewerImage = {
  src?: string;
  alt?: string;
  label: string;
  num?: string;
};

type Props = {
  images: ViewerImage[];
  openIndex: number | null;
  onClose: () => void;
};

export function ImageViewer({ images, openIndex, onClose }: Props) {
  const [index, setIndex] = React.useState(openIndex ?? 0);
  const thumbsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (openIndex != null) setIndex(openIndex);
  }, [openIndex]);

  const go = React.useCallback(
    (dir: number) => {
      setIndex((i) => (i + dir + images.length) % images.length);
    },
    [images.length]
  );

  React.useEffect(() => {
    if (openIndex == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, go]);

  // Center active thumb
  React.useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip) return;
    const active = strip.querySelector<HTMLElement>(".is-active");
    if (!active) return;
    const stripRect = strip.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const delta =
      activeRect.left -
      stripRect.left -
      stripRect.width / 2 +
      activeRect.width / 2;
    strip.scrollBy({ left: delta, behavior: "smooth" });
  }, [index]);

  // Swipe
  const touchStartX = React.useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  const isOpen = openIndex != null;
  const current = images[index];

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/75" />
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className="fixed inset-0 top-0 left-0 max-w-none sm:max-w-none w-screen h-screen translate-x-0 translate-y-0 sm:translate-x-0 sm:translate-y-0 p-0 bg-transparent ring-0 rounded-none grid grid-rows-[auto_1fr_auto] gap-0"
        >
          <DialogTitle className="sr-only">
            Visionneuse d&apos;images — {current?.label}
          </DialogTitle>

          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 text-white">
            <span className="font-mono text-[11px] tracking-widest uppercase text-white/70">
              <strong className="text-white font-medium tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </strong>{" "}
              / {String(images.length).padStart(2, "0")} — {current?.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="w-10 h-10 rounded-full border border-white/25 text-white inline-flex items-center justify-center transition hover:bg-white/10 hover:rotate-90 duration-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Stage */}
          <div
            className="relative flex items-center justify-center px-4 md:px-20 min-h-0"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Image précédente"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-13 md:h-13 rounded-full border border-white/25 bg-black/40 text-white inline-flex items-center justify-center backdrop-blur transition hover:bg-white/15 hover:-translate-x-0.5 z-10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>

            <div className="relative w-full max-w-[1400px] h-full flex items-center justify-center">
              {images.map((img, i) => {
                const active = i === index;
                const prev = i === (index - 1 + images.length) % images.length;
                const next = i === (index + 1) % images.length;
                const tx = active ? "0%" : prev ? "-8%" : "8%";
                return (
                  <div
                    key={i}
                    aria-hidden={!active}
                    className="absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                    style={{
                      opacity: active ? 1 : 0,
                      transform: `translateX(${tx}) scale(${active ? 1 : 0.94})`,
                      willChange: active || prev || next ? "transform, opacity" : "auto",
                      pointerEvents: active ? "auto" : "none",
                    }}
                  >
                    <MediaFrame img={img} />
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Image suivante"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-13 md:h-13 rounded-full border border-white/25 bg-black/40 text-white inline-flex items-center justify-center backdrop-blur transition hover:bg-white/15 hover:translate-x-0.5 z-10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          {/* Thumbnails */}
          <div
            ref={thumbsRef}
            className="flex justify-center gap-2 overflow-x-auto px-7 pt-4 pb-6"
          >
            {images.map((img, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Voir ${img.label}`}
                className={cn(
                  "relative flex-none w-21 h-14 rounded-md overflow-hidden border-2 border-transparent bg-muted cursor-pointer transition",
                  i === index
                    ? "is-active opacity-100 border-white"
                    : "opacity-55 hover:opacity-90 hover:-translate-y-0.5"
                )}
                style={{ width: 84, height: 56 }}
              >
                {img.src ? (
                  <img
                    src={img.src}
                    alt=""
                    className="w-full h-full object-cover block"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, transparent 0 8px, rgba(0,0,0,0.12) 8px 9px)",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function MediaFrame({ img }: { img: ViewerImage }) {
  const placeholder = !img.src;
  return (
    <div
      className={cn(
        "relative w-[min(1100px,100%)] aspect-[16/10] rounded-2xl overflow-hidden bg-muted",
        "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55),0_4px_20px_-4px_rgba(0,0,0,0.3)]"
      )}
    >
      {img.src ? (
        <img
          src={img.src}
          alt={img.alt || img.label}
          className="w-full h-full object-cover block"
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0 22px, rgba(0,0,0,0.08) 22px 24px)",
          }}
        />
      )}
      <div className="absolute bottom-4 left-4 right-4 flex items-baseline gap-3.5 px-3.5 py-2.5 rounded-lg bg-black/55 backdrop-blur text-white">
        <span className="font-mono text-[10.5px] tracking-widest uppercase text-white/60">
          {img.num ?? ""}
        </span>
        <span className="font-heading text-[18px] -tracking-[0.01em]">
          {img.label}
        </span>
      </div>
      {placeholder && (
        <span className="sr-only">Image placeholder — {img.label}</span>
      )}
    </div>
  );
}
