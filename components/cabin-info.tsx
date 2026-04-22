const HOUSE_RULES = [
  'No smoking inside the cabin',
  'Pets welcome with prior approval',
  'Maximum 6 guests',
  'Check-in from 15:00, check-out by 11:00',
  'Please leave the cabin as you found it',
  'Quiet hours from 22:00 to 08:00',
]

const PHOTOS = [
  { alt: 'Exterior' },
  { alt: 'Living room' },
  { alt: 'Bedroom' },
  { alt: 'Kitchen' },
]

export function CabinInfo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PHOTOS.map((photo) => (
          <div
            key={photo.alt}
            className="aspect-square relative rounded-md overflow-hidden bg-stone-200 dark:bg-stone-700 flex items-center justify-center"
          >
            <span className="text-xs text-stone-400">{photo.alt}</span>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-3">
          About the Cabin
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed max-w-prose">
          Les Tsabloz is a private cabin nestled in the mountains — a peaceful
          retreat surrounded by nature with all the comforts of home. Perfect
          for families, couples, or a small group of friends seeking calm and
          clean mountain air.
        </p>
      </div>

      <div>
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-3">
          House Rules
        </h2>
        <ul className="flex flex-col gap-2">
          {HOUSE_RULES.map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-2 text-stone-600 dark:text-stone-400"
            >
              <span className="mt-0.5 text-[#7C9A7E] dark:text-[#8FAF91] select-none">
                —
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
