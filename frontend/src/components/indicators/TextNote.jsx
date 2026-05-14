import React from 'react'
import { motion } from 'framer-motion'

export default function TextNote({ config = {}, section }) {
  const html = config.html_content || ''
  const plainText = config.text || section?.title || ''

  return (
    <motion.div
      className="h-full overflow-auto p-3 text-sm leading-relaxed"
      style={{ color: 'var(--color-text)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm max-w-none" />
      ) : (
        <p>{plainText}</p>
      )}
    </motion.div>
  )
}
