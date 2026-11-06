import React, { useState, useEffect } from 'react'
import { Camera, Coffee, Gamepad2, Image as ImageIcon } from 'lucide-react'

export interface ProductImageProps {
  src?: string | null
  alt: string
  category?: string
  priority?: boolean
  className?: string
  onAddPhotoClick?: () => void
}

export function ProductImage({
  src,
  alt,
  category = 'Alimentos y bebidas',
  priority = false,
  className = '',
  onAddPhotoClick,
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [src])

  const isGame = category.toLowerCase().includes('juego')
  const CategoryIcon = isGame ? Gamepad2 : Coffee

  const hasValidImage = src && !error && src.trim().length > 0

  return (
    <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[oklch(96%_0.02_55)] flex items-center justify-center shrink-0 ${className}`}>
      {hasValidImage ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 bg-black/5 animate-pulse" />
          )}
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        /* Placeholder elegante Living (fondo moss, icono de categoría, inicial) */
        <div className="flex flex-col items-center justify-center p-4 text-center gap-2 w-full h-full bg-gradient-to-br from-[oklch(94%_0.05_55)] to-[oklch(92%_0.06_55)]">
          <div className="w-12 h-12 rounded-full bg-white/70 backdrop-blur-sm text-[oklch(48%_0.16_45)] flex items-center justify-center font-bold text-lg shadow-sm">
            {alt ? alt.charAt(0).toUpperCase() : <CategoryIcon className="w-6 h-6" />}
          </div>
          <span className="text-xs font-semibold text-[oklch(48%_0.16_45)] line-clamp-1 max-w-[85%]">
            {alt || 'Sin foto'}
          </span>
          {onAddPhotoClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAddPhotoClick()
              }}
              className="mt-1 px-3 py-1 rounded-full bg-white text-xs font-bold text-[#1a1b21] shadow-sm hover:shadow hover:bg-black/5 transition-all flex items-center gap-1.5"
            >
              <Camera className="w-3 h-3 text-[oklch(48%_0.16_45)]" />
              <span>Agregar foto</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

