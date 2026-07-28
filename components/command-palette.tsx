'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Article, ArticleManager } from '@/lib/storage'

interface CommandPaletteProps {
  open: boolean
  articles: Article[]
  onClose: () => void
  onSelect: (article: Article) => void
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'المشاريع':    'linear-gradient(135deg, #6366f1, #2563eb)',
  'الإجراءات':   'linear-gradient(135deg, #f59e0b, #ef4444)',
  'الشركة':      'linear-gradient(135deg, #10b981, #06b6d4)',
  'أسئلة شائعة': 'linear-gradient(135deg, #8b5cf6, #ec4899)',
}

export default function CommandPalette({
  open,
  articles,
  onClose,
  onSelect,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const manager = new ArticleManager()
  const results = useMemo(() => {
    if (!query.trim()) return articles
    return manager.searchArticles(query)
  }, [query, articles])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + results.length) % results.length)
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        onSelect(results[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, results, selectedIndex, onSelect])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-[12vh] px-6"
      style={{
        background: 'rgba(15,23,42,.5)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[580px] rounded-2xl overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          boxShadow: '0 24px 64px rgba(15,23,42,.2), 0 8px 24px rgba(15,23,42,.1)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Gradient accent */}
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #6366f1, #2563eb, #06b6d4, #8b5cf6)' }} />

        {/* Input */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #eef4ff, #f0f0ff)',
              border: '1px solid var(--blue-100)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="ابحث عن مقال..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 text-[15px] outline-none bg-transparent"
            style={{ color: 'var(--ink)' }}
            autoFocus
          />
          <kbd
            className="text-[11px] px-2 py-1 rounded-md border"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--faint)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          className="max-h-[380px] overflow-y-auto p-2"
          style={{ background: 'var(--surface-2)' }}
        >
          {results.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--muted)' }}>
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-sm">مفيش نتائج</p>
            </div>
          ) : (
            <div className="stagger-children">
              {results.map((article, idx) => {
                const catGrad = CATEGORY_GRADIENTS[article.category] || CATEGORY_GRADIENTS['المشاريع']
                return (
                  <div
                    key={article.id}
                    className="px-3 py-[10px] rounded-xl cursor-pointer transition-all duration-150 animate-slideInLeft"
                    style={{
                      background: selectedIndex === idx ? 'var(--surface)' : 'transparent',
                      boxShadow: selectedIndex === idx ? 'var(--sh-sm)' : 'none',
                    }}
                    onClick={() => onSelect(article)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-[34px] h-[34px] rounded-xl flex items-center justify-center text-sm flex-shrink-0 text-white"
                        style={{
                          background: catGrad,
                          boxShadow: selectedIndex === idx ? '0 2px 8px rgba(99,102,241,.2)' : 'none',
                        }}
                      >
                        {article.icon || '📄'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--ink)' }}>
                          {article.title}
                        </div>
                        <div className="text-[12px]" style={{ color: 'var(--muted)' }}>
                          {article.category}
                        </div>
                      </div>
                      {selectedIndex === idx && (
                        <div
                          className="text-[10px] px-2 py-1 rounded-md font-mono"
                          style={{ background: 'var(--surface-2)', color: 'var(--faint)' }}
                        >
                          ⏎
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-5 px-5 py-3 border-t text-[11.5px]"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--muted)',
          }}
        >
          <div className="flex items-center gap-[5px]">
            <kbd
              className="px-[6px] py-[2px] rounded-md text-[10px] border font-mono"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
            >↑↓</kbd>
            Navigate
          </div>
          <div className="flex items-center gap-[5px]">
            <kbd
              className="px-[6px] py-[2px] rounded-md text-[10px] border font-mono"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
            >⏎</kbd>
            Select
          </div>
          <div className="flex items-center gap-[5px]">
            <kbd
              className="px-[6px] py-[2px] rounded-md text-[10px] border font-mono"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
            >Esc</kbd>
            Close
          </div>
        </div>
      </div>
    </div>
  )
}
