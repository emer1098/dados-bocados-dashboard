import React, { useState, useRef, useEffect } from 'react'
import {
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from './Button'

export interface ImageUploaderProps {
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
  onImageRemoved?: () => void
  className?: string
}

export function ImageUploader({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  className = '',
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(currentImageUrl || null)
  }, [currentImageUrl])

  // Compresión en el navegador usando HTMLCanvasElement a WebP (< 1200px, < 400KB)
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        const maxDim = 1200

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo inicializar canvas para compresión'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Fallo al exportar compresión WebP'))
            }
          },
          'image/webp',
          0.82
        )
      }
      img.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada'))
      img.src = URL.createObjectURL(file)
    })
  }

  const processAndUploadFile = async (file: File) => {
    setErrorMessage(null)

    // Validar formato (Rechazar SVG estrictamente)
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      setErrorMessage('Los archivos SVG no están permitidos. Por favor sube una fotografía en JPG, PNG o WebP.')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Formato no compatible. Por favor sube una foto en formato JPG, PNG o WebP.')
      return
    }

    // Validar peso máximo 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La imagen pesa demasiado (máximo 5 MB). Por favor prueba con otra foto o recórtala.')
      return
    }

    setUploading(true)
    setProgress(20)

    try {
      // 1. Comprimir en cliente a WebP
      const compressedBlob = await compressImage(file)
      setProgress(50)

      // Vista previa local inmediata
      const localUrl = URL.createObjectURL(compressedBlob)
      setPreview(localUrl)

      // 2. Subir al servidor (/api/upload)
      const formData = new FormData()
      formData.append(
        'file',
        new File([compressedBlob], `photo_${Date.now()}.webp`, { type: 'image/webp' })
      )

      setProgress(75)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.success && data.url) {
        setProgress(100)
        setPreview(data.url)
        onImageUploaded(data.url)
      } else {
        // Fallback local si upload fallara
        onImageUploaded(localUrl)
      }
    } catch {
      setErrorMessage('Ocurrió un inconveniente al procesar la fotografía. Inténtalo de nuevo.')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 600)
    }
  }

  // Pegar desde portapapeles (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            processAndUploadFile(file)
            break
          }
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  // Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processAndUploadFile(file)
    }
  }

  const handleRemove = () => {
    if (confirm('¿Estás seguro de que deseas quitar esta fotografía?')) {
      setPreview(null)
      if (onImageRemoved) onImageRemoved()
    }
  }

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Vista previa y zona de subida con encuadre 4:3 */}
      {preview ? (
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 border border-black/10 shadow-sm flex items-center justify-center">
          <img
            src={preview}
            alt="Vista previa de producto"
            className="w-full h-full object-cover"
          />

          {/* Botones flotantes de acción */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[#1a1b21] hover:bg-white shadow-md text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Reemplazar foto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reemplazar</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="p-2.5 rounded-full bg-[#fee2e2]/90 backdrop-blur-md text-[#b91c1c] hover:bg-[#fee2e2] shadow-md transition-all"
              title="Quitar foto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Zona interactiva de subida */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-black/15 bg-white/60 hover:bg-white hover:border-[oklch(48%_0.16_45)] transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center gap-3"
        >
          <div className="w-14 h-14 rounded-full bg-[oklch(92%_0.06_55)] text-[oklch(48%_0.16_45)] flex items-center justify-center shadow-sm">
            <Upload className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-[#1a1b21] m-0">
              Arrastra una foto aquí o haz clic para explorar
            </p>
            <p className="text-xs text-[#555869] m-0">
              También puedes pegar con <strong>Ctrl + V</strong> desde el portapapeles.
            </p>
            <p className="text-[11px] text-[#555869]/70 m-0 mt-1">
              JPG, PNG o WebP · Máximo 5 MB · Se optimiza automáticamente a 4:3
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="btn-drop-living !min-h-[40px] !text-xs !py-1 !px-4">
              Elegir archivo
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                cameraInputRef.current?.click()
              }}
              className="btn-drop-living !min-h-[40px] !text-xs !py-1 !px-3 flex items-center gap-1.5"
              title="Tomar foto con la cámara"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Cámara</span>
            </button>
          </div>
        </div>
      )}

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processAndUploadFile(file)
        }}
        className="hidden"
      />

      {/* Input de cámara para tablets/móvil */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processAndUploadFile(file)
        }}
        className="hidden"
      />

      {/* Barra de Progreso */}
      {uploading && (
        <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between text-xs font-semibold text-[#1a1b21]">
            <span>Comprimiendo y guardando foto...</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
            <div
              className="h-full bg-[oklch(48%_0.16_45)] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Mensaje de error humano */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#fee2e2] border border-[#fca5a5] text-[#b91c1c] text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}

