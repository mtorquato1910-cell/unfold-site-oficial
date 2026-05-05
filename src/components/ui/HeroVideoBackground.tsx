'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface HeroVideoBackgroundProps {
  videoSrc: string
  posterSrc: string
  videoFilter?: string
}

export function HeroVideoBackground({ videoSrc, posterSrc, videoFilter }: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mounted, setMounted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleEnded = () => {
      video.currentTime = 0
      video.play().catch(() => {})
    }
    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [])

  const handleCanPlay = () => {
    const video = videoRef.current
    if (video && video.paused) {
      video.play().catch(() => {})
    }
  }

  const showStaticPoster = mounted && reducedMotion

  return (
    <>
      {showStaticPoster ? (
        <Image
          src={posterSrc}
          alt=""
          aria-hidden="true"
          fill
          className="object-cover -z-20"
          priority
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterSrc}
          onCanPlay={handleCanPlay}
          className="absolute inset-0 h-full w-full object-cover -z-20"
          style={videoFilter ? { filter: videoFilter } : undefined}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/95 via-background/85 to-background/55" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.10),transparent_55%)]" />
    </>
  )
}
