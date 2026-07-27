'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Article, ArticleManager } from '@/lib/storage'

interface CommandPaletteProps {
  open: boolean
  articles: Article[]
  onClose: () => void
  onSelect: (article: Article) => void
}

const CATEGORY_COLORS = {
  SQL: '#8b5cf6',
  Script: '#2563eb',
  Guide: '#10b981',
  Config: '#f59e0b',
  API: '#ec4899',
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
      className="fixed inset-0 z-100 flex items-start justify-center pt-[12vh] px-6 animate-fade"
      style={{
        background: 'rgba(15,23,42,.4)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] bg-white rounded-[14px] shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'pop .16s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-[11px] px-[18px] py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            style={{ color: 'var(--faint)' }}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 text-base outline-none"
            style={{
              color: 'var(--ink)',
              fontFamily: 'var(--font-ui)',
            }}
            autoFocus
          />
        </div>

        {/* Results */}
        <div
          className="max-h-[360px] overflow-y-auto p-2"
          style={{ background: 'var(--surface)' }}
        >
          {results.length === 0 ? (
            <div
              className="p-6 text-center"
              style={{ color: 'var(--muted)' }}
            >
              No articles found
            </div>
            ) : (
            results.map((article, idx) => (
              <div
                key={article.id}
                className="px-3 py-2 rounded-[7px] cursor-pointer transition-all"
                style={{
                  background:
                    selectedIndex === idx
                      ? 'var(--blue-50)'
                      : 'transparent',
                }}
                onClick={() => onSelect(article)}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[14px] font-medium truncate"
                      style={{
                        color: 'var(--ink)',
                      }}
                    >
                      {article.title}
                    </div>
                    <div
                      className="text-[12px]"
                      style={{
                        color: 'var(--muted)',
                      }}
                    >
                      {article.category}
                    </div>
                  </div>
                  {selectedIndex === idx && (
                    <div
                      className="text-[11px]"
                      style={{ color: 'var(--faint)' }}
                    >
                      ⏎
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-3 border-t text-[11.5px]"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--muted)',
          }}
        >
          <div className="flex items-center gap-[5px]">
            <kbd
              className="px-[5px] py-[1px] rounded text-[10px] border"
              style={{
                background: 'var(--white)',
                borderColor: 'var(--border)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ↑↓
            </kbd>
            Navigate
          </div>
          <div className="flex items-center gap-[5px]">
            <kbd
              className="px-[5px] py-[1px] rounded text-[10px] border"
              style={{
                background: 'var(--white)',
                borderColor: 'var(--border)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ⏎
            </kbd>
            Select
          </div>
          <div className="flex items-center gap-[5px]">
            <kbd
              className="px-[5px] py-[1px] rounded text-[10px] border"
              style={{
                background: 'var(--white)',
                borderColor: 'var(--border)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Esc
            </kbd>
            Close
          </div>
        </div>
      </div>
    </div>
  )
}
