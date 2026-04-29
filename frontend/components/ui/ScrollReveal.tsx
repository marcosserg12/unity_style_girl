'use client'

import { useEffect, useRef } from 'react'

export default function ScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom')
    targets.forEach(el => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [])

  return null
}
