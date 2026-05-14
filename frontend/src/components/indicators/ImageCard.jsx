import React from 'react'
import { motion } from 'framer-motion'
import { Image } from 'lucide-react'

export default function ImageCard({ config = {}, section }) {
  const src = config.src || ''
  const alt = config.alt || config.caption || section?.title || ''
  const objectFit = config.object_fit || 'contain'

  return (
    <motion.div
      className="h-full flex flex-col items-center justify-center overflow-hidden rounded-xl"
      style={{ background: config.bg || 'transparent' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={alt}
            className="w-full h-full"
            style={{ objectFit, maxHeight: config.caption ? 'calc(100% - 24px)' : '100%' }}
          />
          {config.caption && (
            <div className="text-xs text-center px-2 py-1" style={{ color: 'var(--color-text-muted)' }}>
              {config.caption}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 opacity-30">
          <Image size={32} />
          <span className="text-xs">No image</span>
        </div>
      )}
    </motion.div>
  )
}
