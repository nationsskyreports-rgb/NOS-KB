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

const CATEGORY_COLORS: Record<string, string> = {
  'المشاريع': '#2563eb',
  'الإجراءات': '#f59e0b',
  'الشركة': '#10b981',
  'أسئلة شائعة': '#8b5cf6',
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
        <div className="w-full max-w-[760px] py-10 flex items-center justify-center">
          <div className="text-center" style={{ color: 'var(--muted)' }}>
            <div className="text-4xl mb-4">📚</div>
            <p className="text-lg font-medium mb-2">اختر مقال من القائمة</p>
            <p className="text-sm">Select an article to get started</p>
          </div>
        </div>
      </main>
    )
  }

  const catColor = CATEGORY_COLORS[article.category] || '#64748b'
  const recent = isRecent(article.updatedAt)

  return (
    <div className="flex flex-1 min-w-0">
      <main className="flex-1 min-w-0 flex justify-center px-10 md:px-10 px-4" style={{ background: 'var(--bg)' }}>
        <article className="w-full max-w-[760px] py-10 pb-[100px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12.5px] mb-[18px]" style={{ color: 'var(--muted)' }}>
            <span>قاعدة المعرفة</span>
            <span style={{ color: 'var(--faint)' }}>/</span>
            <span className="flex items-center gap-[6px] font-semibold">
              <div className="w-[7px] h-[7px] rounded-[3px]" style={{ background: catColor }} />
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-[34px] font-bold leading-[1.15] mb-[14px]"
            style={{ color: 'var(--ink)', letterSpacing: '-0.8px' }}
          >
            {article.title}
          </h1>

          {/* Meta */}
          <div
            className="flex flex-wrap items-center gap-3 text-[13px] pb-[22px] mb-[30px] border-b"
            style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
          >
            {/* Updated date */}
            <div className="flex items-center gap-[6px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>آخر تحديث: {formatDate(article.updatedAt)}</span>
            </div>

            {/* 🆕 badge */}
            {recent && (
              <span
                className="text-[11px] font-bold px-[8px] py-[2px] rounded-full"
                style={{ background: '#dcfce7', color: '#15803d' }}
              >
                🆕 جديد
              </span>
            )}

            {/* Category pill */}
            <span
              className="text-[11.5px] font-semibold px-[9px] py-[3px] rounded-full"
              style={{ background: catColor + '14', color: catColor }}
            >
              {article.category}
            </span>

            {/* Admin toolbar */}
            {isAdmin && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={onEdit}
                  className="h-8 px-3 rounded-[7px] text-[12.5px] font-semibold border flex items-center gap-[6px] transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink-2)' }}
                >
                  ✏️ تعديل
                </button>
                <button
                  onClick={() => { if (confirm('هل أنت متأكد من حذف هذا المقال؟')) onDelete() }}
                  className="h-8 px-3 rounded-[7px] text-[12.5px] font-semibold border flex items-center gap-[6px] transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink-2)' }}
                >
                  🗑️
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <RenderMarkdown content={article.content} />
          </div>
        </article>
      </main>

      {/* TOC */}
      {headings.length > 0 && (
        <aside
          className="w-[200px] flex-shrink-0 h-[calc(100vh-60px)] sticky top-[60px] p-[20px] py-[44px] overflow-y-auto hidden lg:block"
          style={{ background: 'var(--bg)' }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--faint)' }}>
            في الصفحة دي
          </div>
          <nav className="space-y-0">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className="block text-[12.5px] py-1 px-3 border-l-2 transition-all hover:border-blue-400"
                style={{
                  color: 'var(--muted)',
                  borderColor: 'var(--border)',
                  paddingLeft: `${(heading.level - 2) * 12 + 12}px`,
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
