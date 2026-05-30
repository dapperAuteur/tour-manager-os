import Link from 'next/link'

interface Photo {
  id: string
  cloudinary_url: string
  width: number | null
  height: number | null
  caption: string | null
}

interface PhotoGridProps {
  photos: Photo[]
}

function thumbnailUrl(url: string, width = 600): string {
  // Cloudinary lets you inject transformations into the URL path
  // between /upload/ and the public_id. Use auto format + width for
  // bandwidth + quality.
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width},c_limit/`,
  )
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <ul
      role="list"
      className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
    >
      {photos.map((p) => (
        <li key={p.id} className="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
          <Link
            href={`/photos/${p.id}`}
            className="group block focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={p.caption || 'Fan photo'}
          >
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl(p.cloudinary_url, 600)}
                alt={p.caption || ''}
                width={p.width ?? undefined}
                height={p.height ?? undefined}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
            {p.caption && (
              <p className="line-clamp-2 px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                {p.caption}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
