'use client'

import { useEffect, useState, useCallback } from 'react'

interface CountdownProps {
  targetDate: Date
  label: string
  onExpired?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function Countdown({ targetDate, label, onExpired }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(targetDate))
  const [expired, setExpired] = useState(false)

  const tick = useCallback(() => {
    const t = calcTimeLeft(targetDate)
    setTimeLeft(t)
    if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
      setExpired(true)
      onExpired?.()
    }
  }, [targetDate, onExpired])

  useEffect(() => {
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  if (expired) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <span
          style={{
            color: '#e3ef38',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: '32px',
            letterSpacing: '0.05em',
          }}
        >
          GESLOTEN
        </span>
      </div>
    )
  }

  const units = [
    { value: timeLeft.days, suffix: 'DAGEN' },
    { value: timeLeft.hours, suffix: 'UUR' },
    { value: timeLeft.minutes, suffix: 'MIN' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <p
        style={{
          color: '#cccccc',
          fontSize: '11px',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: 0,
        }}
      >
        {label}
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {units.map((u, i) => (
          <div key={u.suffix} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                padding: '8px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '72px',
              }}
            >
              <span
                style={{
                  color: '#e3ef38',
                  fontWeight: 700,
                  fontSize: '40px',
                  lineHeight: '1',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {u.value}
              </span>
              <span
                style={{
                  color: '#999999',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  marginTop: '6px',
                  textTransform: 'uppercase',
                }}
              >
                {u.suffix}
              </span>
            </div>
            {i < units.length - 1 && (
              <span
                style={{
                  color: '#444444',
                  fontWeight: 400,
                  fontSize: '28px',
                  padding: '0 4px',
                  lineHeight: '1',
                  marginBottom: '16px',
                }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
