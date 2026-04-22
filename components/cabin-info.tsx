// components/cabin-info.tsx
"use client";

import * as React from "react";
import { ImageViewer, type ViewerImage } from "@/components/image-viewer";
import { cn } from "@/lib/utils";

interface ArrivalRule {
  title: string;
  content: React.ReactNode;
}

const ARRIVAL_RULES: ArrivalRule[] = [
  {
    title: "Accès au chalet",
    content: (
      <>
        La clé se trouve dans la boîte à clés, fixée contre une poutre au fond
        de la pièce, à droite de la porte d’entrée.
        <br />
        Code d’accès : <strong>1890</strong>
      </>
    ),
  },
  {
    title: "Gestion du bûcher",
    content: (
      <>
        Les clés du bûcher (porte-clés{" "}
        <strong>&laquo;&thinsp;Bourdeau&thinsp;&raquo;</strong>) sont accrochées
        à l’intérieur du chalet, juste à côté de la porte d’entrée. Vous y
        trouverez :
        <ul className="mt-1.5 space-y-0.5 pl-0 list-none">
          {[
            "La grille pour le barbecue.",
            "Le matériel de nettoyage (panosse et seau).",
            "Le stock de bois (petit bois).",
            "Les bonbonnes de gaz de rechange.",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-[var(--lt-moss)] select-none">–</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    title: "Eau chaude et gaz",
    content: (
      <>
        Le système fonctionne au gaz. Les bonbonnes sont situées dans le bûcher.
        Elles sont déjà ouvertes :{" "}
        <strong>il n’est pas nécessaire d’y toucher.</strong>
      </>
    ),
  },
  {
    title: "Chauffage",
    content:
      "Veuillez ouvrir les radiateurs en fonction de la saison. Des indications supplémentaires sont affichées directement sur place pour vous guider.",
  },
  {
    title: "Cheminée et sécurité",
    content: (
      <ul className="space-y-0.5 pl-0 list-none">
        {[
          <>
            <strong>Bois :</strong> Le petit bois est au bûcher, mais les
            grosses bûches sont déjà à votre disposition à côté de la cheminée
            du salon.
          </>,
          <>
            <strong>Sécurité :</strong> Merci de toujours bien refermer la porte
            de la cheminée si vous devez quitter le chalet.
          </>,
        ].map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--lt-moss)] select-none">–</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Stockage de la nourriture",
    content: (
      <>
        Deux options s’offrent à vous :
        <ul className="mt-1.5 space-y-0.5 pl-0 list-none">
          {[
            "Le réfrigérateur.",
            "Le garde-manger (situé dans la pièce à côté de la cuisine, en bas des escaliers).",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-[var(--lt-moss)] select-none">–</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 mb-0">
          <strong>Attention :</strong> Pour éviter d’attirer les souris, veillez
          à bien utiliser le garde-manger fermé.
        </p>
      </>
    ),
  },
];

const DEPARTURE_RULES: ArrivalRule[] = [
  {
    title: "Checklist et préparation",
    content: (
      <>
        Veuillez suivre la checklist complète envoyée précédemment ; une copie
        est également affichée derrière la porte d'entrée.
        <ul className="mt-1.5 space-y-0.5 pl-0 list-none">
          <li className="flex gap-2">
            <span className="text-[var(--lt-moss)] select-none">–</span>
            <span>
              <strong>Bois :</strong> Merci de recharger quelques bûches pour
              les prochains occupants. Le stock se situe à l'extérieur, juste
              devant le salon.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Nettoyage du chalet",
    content: (
      <ul className="space-y-0.5 pl-0 list-none">
        {[
          <>
            <strong>Sols :</strong> Passez l'aspirateur dans toutes les pièces
            et la serpillère (cuisine, toilettes et salon).
          </>,
          <>
            <strong>Sanitaires :</strong> Nettoyez soigneusement la douche, le
            lavabo et la cuvette des toilettes.
          </>,
          <>
            <strong>Matériel :</strong> Vous trouverez le nécessaire dans
            l'armoire vers la porte d'entrée, sous l'escalier à l'étage et dans
            le bûcher.
          </>,
        ].map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--lt-moss)] select-none">–</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Déchets et vivres",
    content: (
      <ul className="space-y-0.5 pl-0 list-none">
        {[
          <>
            <strong>Poubelles :</strong> Sortez les sacs et les bouteilles
            vides. La déchetterie se trouve à l'entrée du village de Vercorin
            (en arrivant de Sierre).
          </>,
          <>
            <strong>Nourriture :</strong> Veillez à bien vider entièrement le
            réfrigérateur et le garde-manger.
          </>,
        ].map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--lt-moss)] select-none">–</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Réglage du chauffage",
    content: (
      <ul className="space-y-0.5 pl-0 list-none">
        {[
          <>
            <strong>Salon :</strong> Remettez les radiateurs sur{" "}
            <strong>12°C</strong>.
          </>,
          <>
            <strong>Escaliers :</strong> Éteignez complètement le radiateur de
            cette zone.
          </>,
        ].map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--lt-moss)] select-none">–</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Fermeture et remise des clés",
    content: (
      <ul className="space-y-0.5 pl-0 list-none">
        {[
          "Fermez le chalet à clé.",
          <>
            Replacez la clé dans la boîte sécurisée (Code :{" "}
            <strong>1890</strong>).
          </>,
        ].map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--lt-moss)] select-none">–</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Paiement",
    content: (
      <ul className="space-y-0.5 pl-0 list-none">
        <li className="flex gap-2">
          <span className="text-[var(--lt-moss)] select-none">–</span>
          <span>
            Procédez au règlement de votre séjour en vous référant aux
            indications de la page{" "}
            <strong>&laquo;&thinsp;Tarifs&thinsp;&raquo;</strong>.
          </span>
        </li>
      </ul>
    ),
  },
];

// Replace empty `src` with real image URLs once available.
const CABIN_IMAGES: ViewerImage[] = [
  {
    num: "01",
    label: "extérieur du chalet",
    src: "/chalet_img/exterior.jpg",
  },
  { num: "02", label: "séjour", src: "/chalet_img/living-room.jpg" },
  { num: "03", label: "chambre", src: "/chalet_img/room1.jpg" },
  { num: "04", label: "cuisine", src: "/chalet_img/kitchen.jpg" },
  { num: "05", label: "terrasse", src: "/chalet_img/terrace.jpg" },
  { num: "06", label: "vue", src: "/chalet_img/panorama.jpg" },
];

function GalleryTile({
  index,
  image,
  className,
  onOpen,
}: {
  index: number;
  image: ViewerImage;
  className?: string;
  onOpen: (i: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Agrandir l'image ${image.label}`}
      className={cn(
        "lt-placeholder lt-gallery-item group relative overflow-hidden",
        "cursor-zoom-in transition-all duration-500",
        "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_oklch(from_var(--lt-ink)_l_c_h/0.18)]",
        className,
      )}
    >
      {image.src ? (
        <img
          src={image.src}
          alt={image.alt || image.label}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}
      <span className="relative z-[1]">
        {image.num} · {image.label}
      </span>
      {/* Magnifier indicator */}
      <span
        aria-hidden
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[var(--lt-surface)] border border-[var(--lt-line)] opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 grid place-items-center text-[var(--lt-ink)]"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      </span>
    </button>
  );
}

export function CabinInfo() {
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col gap-11">
      {/* Asymmetric gallery — clickable */}
      <div
        className="grid gap-2.5"
        style={{
          gridTemplateColumns: "1.6fr 1fr",
          gridTemplateRows: "200px 200px",
        }}
      >
        <GalleryTile
          index={0}
          image={CABIN_IMAGES[0]}
          onOpen={setViewerIndex}
          className="row-span-2 h-full"
        />
        <GalleryTile
          index={1}
          image={CABIN_IMAGES[1]}
          onOpen={setViewerIndex}
          className="h-full"
        />
        <GalleryTile
          index={2}
          image={CABIN_IMAGES[2]}
          onOpen={setViewerIndex}
          className="h-full"
        />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <GalleryTile
          index={3}
          image={CABIN_IMAGES[3]}
          onOpen={setViewerIndex}
          className="h-[140px]"
        />
        <GalleryTile
          index={4}
          image={CABIN_IMAGES[4]}
          onOpen={setViewerIndex}
          className="h-[140px]"
        />
        <GalleryTile
          index={5}
          image={CABIN_IMAGES[5]}
          onOpen={setViewerIndex}
          className="h-[140px]"
        />
      </div>

      {/* Description block */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:mb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2.5">
            <span className="lt-numeral">✦</span>
            <span className="lt-mono">Le lieu</span>
          </div>
          <h2 className="lt-display text-[28px] m-0 text-[var(--lt-ink)]">
            Un refuge boisé, ancré dans la montagne.
          </h2>
          <p className="text-[var(--lt-ink-soft)] text-[15px] leading-relaxed max-w-[52ch] m-0">
            Les Tsabloz est un chalet familial niché à 1 211 mètres, en dehors
            de Vercorin. Ancien mayen, il accueille jusqu’à 10 voyageurs en
            quête de calme, de nature.
          </p>
        </div>
        <div className="flex gap-8 pt-5 md:pt-0 border-t border-[var(--lt-line)] md:border-t-0 md:border-l md:pl-8">
          {[
            ["10", "voyageurs"],
            ["4", "chambres"],
            ["1 211", "mètres"],
          ].map(([n, l]) => (
            <div key={l} className="text-right">
              <div className="lt-display text-[28px] text-[var(--lt-moss)]">
                {n}
              </div>
              <span className="lt-mono">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Arrival + Departure side by side */}
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {(
          [
            { numeral: "§ 01", label: "En arrivant", rules: ARRIVAL_RULES },
            { numeral: "§ 02", label: "En partant", rules: DEPARTURE_RULES },
          ] as const
        ).map(({ numeral, label, rules }) => (
          <div key={label}>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-baseline gap-2.5">
                <span className="lt-numeral">{numeral}</span>
                <span className="lt-mono">{label}</span>
              </div>
              <h2 className="lt-display text-[28px] m-0 text-[var(--lt-ink)]">
                Les choses à faire.
              </h2>
            </div>
            <ul className="list-none p-0 m-0 flex flex-col">
              {rules.map((rule, i) => (
                <li
                  key={rule.title}
                  className="grid grid-cols-[130px_1fr] py-3.5 items-start gap-4"
                  style={{
                    borderTop:
                      i === 0 ? "none" : "1px solid var(--lt-line-soft)",
                  }}
                >
                  <span className="lt-mono text-[var(--lt-moss)] pt-px">
                    {String(i + 1).padStart(2, "0")} · {rule.title}
                  </span>
                  <span className="text-[var(--lt-ink)] text-[15px] leading-relaxed">
                    {rule.content}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <ImageViewer
        images={CABIN_IMAGES}
        openIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
      />
    </div>
  );
}
