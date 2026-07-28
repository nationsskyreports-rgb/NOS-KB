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

const CATEGORY_META: Record<string, { gradient: string; from: string; to: string }> = {
  'المشاريع':    { gradient: 'linear-gradient(135deg, #6366f1, #2563eb)', from: '#6366f1', to: '#2563eb' },
  'الإجراءات':   { gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', from: '#f59e0b', to: '#ef4444' },
  'الشركة':      { gradient: 'linear-gradient(135deg, #10b981, #06b6d4)', from: '#10b981', to: '#06b6d4' },
  'أسئلة شائعة': { gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', from: '#8b5cf6', to: '#ec4899' },
}

function isRecent(timestamp: number): boolean {
  return Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمبارح'
  if (diffDays < 7) return `من ${diffDays} أيام`
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function MainContent({
  article,
  isAdmin,
  onEdit,
  onDelete,
}: MainContentProps) {
  const headings = useMemo(() => {
    if (!article) return []
    const lines = article.content.split('\n')
    return lines
      .filter((line) => line.startsWith('## ') || line.startsWith('### '))
      .map((line) => {
        const level = line.startsWith('### ') ? 3 : 2
        const text = line.replace(/^#+\s/, '')
        const id = text.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, '').replace(/\s+/g, '-')
        return { id, text, level }
      })
  }, [article])

  if (!article) {
    return (
      <main className="flex-1 min-w-0 flex justify-center px-10" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-[760px] py-10 flex items-center justify-center animate-fadeIn">
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5"
              style={{
                background: 'linear-gradient(135deg, #eef4ff, #f0f0ff)',
                border: '1px solid var(--blue-100)',
              }}
            >
              📚
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>
              اختر مقال من القائمة
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Select an article to get started
            </p>
          </div>
        </div>
      </main>
    )
  }

  const meta = CATEGORY_META[article.category] || CATEGORY_META['المشاريع']
  const recent = isRecent(article.updatedAt)

  return (
    <div className="flex flex-1 min-w-0">
      <main className="flex-1 min-w-0 flex justify-center px-10 md:px-10 px-4" style={{ background: 'var(--bg)' }}>
        <article className="w-full max-w-[760px] py-10 pb-[100px] animate-fadeIn">

          {/* Hero Card */}
          <div
            className="rounded-2xl overflow-hidden mb-8"
            style={{
              background: 'var(--surface)',
              boxShadow: 'var(--sh)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Gradient Top Bar */}
            <div className="h-[4px]" style={{ background: meta.gradient }} />

            <div className="p-7 pb-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[12.5px] mb-4" style={{ color: 'var(--muted)' }}>
                <span>📚</span>
                <span>قاعدة المعرفة</span>
                <span style={{ color: 'var(--faint)' }}>/</span>
                <span className="flex items-center gap-[6px] font-semibold">
                  <div
                    className="w-[7px] h-[7px] rounded-full"
                    style={{ background: meta.gradient }}
                  />
                  {article.category}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-[32px] font-extrabold leading-[1.15] mb-4"
                style={{ color: 'var(--ink)', letterSpacing: '-0.8px' }}
              >
                {article.title}
              </h1>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-3 text-[13px]" style={{ color: 'var(--muted)' }}>
                {/* Updated date */}
                <div
                  className="flex items-center gap-[6px] px-3 py-[5px] rounded-lg"
                  style={{ background: 'var(--surface-2)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>آخر تحديث: {formatDate(article.updatedAt)}</span>
                </div>

                {/* 🆕 badge */}
                {recent && (
                  <span
                    className="text-[11px] font-bold px-3 py-[5px] rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
                      color: '#15803d',
                    }}
                  >
                    🆕 جديد
                  </span>
                )}

                {/* Category pill */}
                <span
                  className="text-[11.5px] font-bold px-3 py-[5px] rounded-lg text-white"
                  style={{
                    background: meta.gradient,
                    boxShadow: `0 2px 8px ${meta.from}25`,
                  }}
                >
                  {article.category}
                </span>

                {/* Admin toolbar */}
                {isAdmin && (
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={onEdit}
                      className="h-8 px-4 rounded-lg text-[12.5px] font-semibold flex items-center gap-[6px] transition-all duration-200 text-white"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #2563eb)',
                        boxShadow: '0 2px 8px rgba(99,102,241,.25)',
                      }}
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      onClick={() => { if (confirm('هل أنت متأكد من حذف هذا المقال؟')) onDelete() }}
                      className="h-8 px-3 rounded-lg text-[12.5px] font-semibold border flex items-center gap-[6px] transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      style={{ borderColor: 'var(--border)', color: 'var(--ink-2)' }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className="rounded-2xl p-8 animate-slideUp"
            style={{
              background: 'var(--surface)',
              boxShadow: 'var(--sh-sm)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="prose max-w-none">
              <RenderMarkdown content={article.content} />
            </div>
          </div>
        </article>
      </main>

      {/* TOC */}
      {headings.length > 0 && (
        <aside
          className="w-[210px] flex-shrink-0 h-[calc(100vh-64px)] sticky top-[64px] p-5 py-11 overflow-y-auto hidden lg:block"
          style={{ background: 'var(--bg)' }}
        >
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
            style={{ color: 'var(--faint)' }}
          >
            <span>📑</span>
            في الصفحة دي
          </div>
          <nav className="space-y-0">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className="block text-[12.5px] py-[6px] px-3 border-l-2 transition-all duration-150"
                style={{
                  color: 'var(--muted)',
                  borderColor: 'var(--border)',
                  paddingLeft: `${(heading.level - 2) * 12 + 12}px`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1'
                  e.currentTarget.style.color = '#6366f1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--muted)'
                }}
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById(heading.id)
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
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
