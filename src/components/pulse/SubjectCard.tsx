'use client'

import type { Subject } from '@/products/demachine/theme'

interface SubjectCardProps {
  subject: Subject
  selected: boolean
  onClick: () => void
}

export default function SubjectCard({ subject, selected, onClick }: SubjectCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? '#e3ef38' : '#f4f4f4',
        border: selected ? '1px solid #e3ef38' : '1px solid #e2e2e2',
        borderRadius: 0,
        padding: '20px 16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(227,239,56,0.3)'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          ;(e.currentTarget as HTMLButtonElement).style.background = '#f4f4f4'
        }
      }}
    >
      <span style={{ fontSize: '32px', lineHeight: '1' }}>{subject.emoji}</span>
      <span
        style={{
          color: '#121212',
          fontWeight: 700,
          fontSize: '15px',
          lineHeight: '1.2',
          textAlign: 'center',
        }}
      >
        {subject.label}
      </span>
    </button>
  )
}
