'use client'
import { useState, useEffect } from 'react'

export function CountdownTimer({ betsLockedAt }: { betsLockedAt: Date }) {
  const [display, setDisplay] = useState('')
  const [color, setColor] = useState('text-muted-foreground')

  useEffect(() => {
    function update() {
      const diff = new Date(betsLockedAt).getTime() - Date.now()
      if (diff <= 0) {
        setDisplay('')
        return
      }

      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)

      if (h > 0) setDisplay(`${h}h ${m}m left`)
      else if (m > 0) setDisplay(`${m}m ${s}s left`)
      else setDisplay(`${s}s left`)

      setColor(
        diff < 30 * 60 * 1000
          ? 'text-red-500'
          : diff < 2 * 60 * 60 * 1000
            ? 'text-amber-500'
            : 'text-muted-foreground',
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [betsLockedAt])

  if (!display) return null

  return <span className={`text-xs ${color}`}>⏱ {display}</span>
}
