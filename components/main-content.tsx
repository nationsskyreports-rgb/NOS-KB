'use client'

import { useMemo } from 'react'
import { Article } from '@/lib/storage'
import RenderMarkdown from './markdown-renderer'

interface MainContentProps {
  article: Article | undefined
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}

const CATEGORY_COLORS = {
  SQL: '#8b5cf6',
  Script: '#2563eb',
  Guide: '#10b981',
  Config: '#f59e0b',
  API: '#ec4899',
}

export default function MainContent({
  article,
  isAdmin,
  onEdit,
  onDelete,
}: MainContentProps) {
  // Extract headings from markdown for TOC
  const headings = useMemo(() => {
    if (!article) return []
    const lines = article.content.split('\n')
    return lines
      .filter((line) => line.startsWith('## ') || line.startsWith('### '))
      .map((line) => {
        const level = line.startsWith('### ') ? 3 : 2
        const text = line.replace(/^#+\s/, '')
        const id = text
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-')
        return { id, text, level }
      })
  }, [article])

  if (!article) {
    return (
      <main
        className="flex-1 min-w-0 flex justify-center px-10"
        style={{ background: 'var(--bg)' }}
      >
        <div className="w-full max-w-[760px] py-10 flex items-center justify-center">
          <div
            className="text-center"
            style={{ color: 'var(--muted)' }}
          >
            <p className="text-lg">Select an article to get started</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="flex flex-1 min-w-0">
      {/* Main Content */}
      <main
        className="flex-1 min-w-0 flex justify-center px-10"
        style={{ background: 'var(--bg)' }}
      >
        <article className="w-full max-w-[760px] py-10 pb-[100px]">
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-[12.5px] mb-[18px]"
            style={{ color: 'var(--muted)' }}
          >
            <span>Knowledge Base</span>
            <span style={{ color: 'var(--faint)' }}>/</span>
            <span
              className="flex items-center gap-[6px] font-semibold"
              style={{ color: 'inherit' }}
            >
              <div
                className="w-[7px] h-[7px] rounded-[3px]"
                style={{
                  background:
                    CATEGORY_COLORS[article.category as keyof typeof CATEGORY_COLORS],
                }}
              />
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-[34px] font-bold leading-[1.15] mb-[14px]"
            style={{
              color: 'var(--ink)',
              letterSpacing: '-0.8px',
            }}
          >
            {article.title}
          </h1>

          {/* Meta */}
          <div
            className="flex items-center gap-4 text-[13px] pb-[22px] mb-[30px] border-b"
            style={{
              color: 'var(--muted)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-[6px]">
              <span>Updated</span>
              <span>
                {new Date(article.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <span
              className="text-[11.5px] font-semibold px-[9px] py-[3px] rounded-full"
              style={{
                background: 'var(--blue-50)',
                color: 'var(--blue-700)',
              }}
            >
              {article.category}
            </span>

            {/* Admin toolbar */}
            {isAdmin && (
              <div
                className="flex items-center gap-2 ml-auto"
                style={{ display: 'flex' }}
              >
                <button
                  onClick={onEdit}
                  className="h-8 px-3 rounded-[7px] text-[12.5px] font-semibold border flex items-center gap-[6px] transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--ink-2)',
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={onDelete}
                  className="h-8 px-3 rounded-[7px] text-[12.5px] font-semibold border flex items-center gap-[6px] transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--ink-2)',
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose">
            <RenderMarkdown content={article.content} />
          </div>
        </article>
      </main>

      {/* TOC Sidebar */}
      {headings.length > 0 && (
        <aside
          className="w-[200px] flex-shrink-0 h-[calc(100vh-60px)] sticky top-[60px] p-[20px] py-[44px] overflow-y-auto hidden lg:block"
          style={{ background: 'var(--bg)' }}
        >
          <div
            className="text-[11px] font-bold uppercase tracking-wide mb-3"
            style={{ color: 'var(--faint)' }}
          >
            On This Page
          </div>
          <nav className="space-y-0">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className="block text-[12.5px] py-1 px-3 border-l-2 transition-all hover:text-ink"
                style={{
                  color: 'var(--muted)',
                  borderColor: 'var(--border)',
                  paddingLeft: `${(heading.level - 2) * 12 + 12}px`,
                }}
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById(heading.id)
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  )
}
