'use client'

import { useState, useEffect } from 'react'

interface TopbarProps {
  isAdmin: boolean
  onLoginClick: () => void
  onLogoutClick: () => void
  onSearchClick: () => void
  onNewArticle: () => void
}

export default function Topbar({
  isAdmin,
  onLoginClick,
  onLogoutClick,
  onSearchClick,
  onNewArticle,
}: TopbarProps) {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform?.toLowerCase().includes('mac'))
  }, [])
  return (
    <header
      className="sticky top-0 z-50 h-[64px] flex items-center gap-5 px-6 border-b"
      style={{
        background: 'rgba(255,255,255,.72)',
        backdropFilter: 'saturate(180%) blur(16px)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-[11px] tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #2563eb, #0ea5e9)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
            boxShadow: '0 3px 12px rgba(99,102,241,.35)',
          }}
        >
          NOS
        </div>
        <div className="flex items-baseline gap-[6px]">
          <span
            className="font-bold text-[16px]"
            style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}
          >
            Knowledge Base
          </span>
          <span
            className="text-[11px] font-semibold px-[7px] py-[1px] rounded-full"
            style={{
              background: 'linear-gradient(135deg, #eef4ff, #f0f0ff)',
              color: 'var(--blue-600)',
              border: '1px solid var(--blue-100)',
            }}
          >
            v2.0
          </span>
        </div>
      </div>

      {/* Search Trigger */}
      <button
        onClick={onSearchClick}
        className="flex-1 max-w-[440px] h-[40px] mx-auto rounded-xl flex items-center gap-3 px-4 text-[13.5px] border transition-all duration-200"
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--border)',
          color: 'var(--faint)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#bdd4ff'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left">Search articles...</span>
        <div className="flex gap-1 ml-auto">
          <kbd
            className="text-[11px] px-[7px] py-[2px] rounded-md border font-mono"
            style={{
              background: 'var(--white)',
              borderColor: 'var(--border)',
              color: 'var(--muted)',
              boxShadow: '0 1px 0 var(--border)',
            }}
          >{isMac ? '⌘' : 'Ctrl'}</kbd>
          <kbd
            className="text-[11px] px-[7px] py-[2px] rounded-md border font-mono"
            style={{
              background: 'var(--white)',
              borderColor: 'var(--border)',
              color: 'var(--muted)',
              boxShadow: '0 1px 0 var(--border)',
            }}
          >K</kbd>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isAdmin && (
          <button
            onClick={onNewArticle}
            className="h-[38px] px-4 rounded-xl text-white text-[13px] font-semibold flex items-center gap-2 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              boxShadow: '0 2px 10px rgba(99,102,241,.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,.4)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        )}

        {isAdmin ? (
          <button
            onClick={onLogoutClick}
            className="h-[38px] px-3 rounded-xl text-[12.5px] font-semibold border flex items-center gap-2 transition-all duration-200 hover:border-red-200 hover:bg-red-50"
            style={{
              color: 'var(--ink-2)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold"
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              }}
            >
              A
            </div>
            Logout
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="h-[38px] px-5 rounded-xl text-white text-[13px] font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              boxShadow: '0 2px 10px rgba(99,102,241,.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,.4)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,.25)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            ✏️ Edit
          </button>
        )}
      </div>
    </header>
  )
}
