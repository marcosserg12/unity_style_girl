'use client'

import Image, { ImageProps } from 'next/image'
import { useState, useEffect } from 'react'

const FALLBACK = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'

interface Props extends Omit<ImageProps, 'onError'> {
  fallback?: string
}

export default function SafeImage({ fallback = FALLBACK, src, ...props }: Props) {
  const [imgSrc, setImgSrc] = useState(src)

  useEffect(() => {
    setImgSrc(src)
  }, [src])

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => setImgSrc(fallback)}
    />
  )
}
