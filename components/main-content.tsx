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

const CAT_GRADIENT: Record<string, string> = {
  'المشاريع':    'linear-gradient(135deg, #2563eb, #7c3aed)',
  'الإجراءات':   'linear-gradient(135deg, #f59e0b, #ef4444)',
  'الشركة':      'linear-gradient(135deg, #10b981, #06b6d4)',
  'أسئلة شائعة': 'linear-gradient(135deg, #8b5cf6, #ec4899)',
}

const CAT_COLOR: Record<string, string> = {
  'المشاريع': '#2563eb', 'الإجراءات': '#f59e0b', 'الشركة': '#10b981', 'أسئلة شائعة': '#8b5cf6',
}

function isRecent(ts: number) { return Date.now() - ts < 7 * 24 * 60 * 60 * 1000 }

function formatDate(ts: number): string {
  const d = new Date(ts)
  const diff = Math.floor((Date.now() - ts) / 86400000)
  if (diff === 0) return 'اليوم'
  if (diff === 1) return 'أمبارح'
  if (diff < 7) return `من ${diff} أيام`
  if (diff < 30) return `من ${Math.floor(diff / 7)} أسابيع`
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function MainContent({ article, isAdmin, onEdit, onDelete }: MainContentProps) {
  const headings = useMemo(() => {
    if (!article) return []
    return article.content.split('\n')
      .filter((l) => l.startsWith('## ') || l.startsWith('### '))
      .map((l) => {
        const level = l.startsWith('### ') ? 3 : 2
        const text = l.replace(/^#+\s/, '')
        const id = text.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, '').replace(/\s+/g, '-')
        return { id, text, level }
      })
  }, [article])

  if (!article) {
    return (
      <main className="flex-1 min-w-0 flex justify-center items-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center py-20">
          <div className="text-6xl mb-6 animate-bounce">📚</div>
          <p className="text-xl font-semibold mb-2" style={{ color: 'var(--ink)' }}>اختر مقال من القائمة</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>أو اضغط ⌘K للبحث</p>
        </div>
      </main>
    )
  }

  const gradient = CAT_GRADIENT[article.category] || '#64748b'
  const color = CAT_COLOR[article.category] || '#64748b'
  const recent = isRecent(article.updatedAt)

  return (
    <div className="flex flex-1 min-w-0">
      <main className="flex-1 min-w-0 flex justify-center px-4 md:px-10" style={{ background: 'var(--bg)' }}>
        <article className="w-full max-w-[760px] py-8 pb-[100px]">

          {/* Hero header with gradient accent */}
          <div className="relative mb-8">
            {/* Gradient bar */}
            <div className="h-[4px] w-[60px] rounded-full mb-6" style={{ background: gradient }} />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] mb-4" style={{ color: 'var(--muted)' }}>
              <span>📚 قاعدة المعرفة</span>
              <span>/</span>
              <span
                className="font-semibold px-2 py-[2px] rounded-md text-[11px]"
                style={{ background: color + '12', color }}
              >
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-[32px] md:text-[38px] font-extrabold leading-[1.1] mb-5"
              style={{ color: 'var(--ink)', letterSpacing: '-0.8px' }}
            >
              {article.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-[13px] pb-5 border-b" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-[6px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                آخر تحديث: {formatDate(article.updatedAt)}
              </div>

              {recent && (
                <span className="text-[10px] font-bold px-[8px] py-[3px] rounded-full animate-pulse" style={{ background: '#dcfce7', color: '#15803d' }}>
                  🆕 جديد
                </span>
              )}

              {isAdmin && (
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={onEdit}
                    className="h-8 px-3 rounded-[8px] text-[12px] font-semibold border flex items-center gap-[5px] transition-all hover:shadow-md hover:border-blue-300 hover:text-blue-700"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink-2)' }}>
                    ✏️ تعديل
                  </button>
                  <button onClick={() => { if (confirm('هل أنت متأكد؟')) onDelete() }}
                    className="h-8 px-3 rounded-[8px] text-[12px] font-semibold border flex items-center gap-[5px] transition-all hover:shadow-md hover:border-red-300 hover:text-red-600"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink-2)' }}>
                    🗑️
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <RenderMarkdown content={article.content} />
          </div>
        </article>
      </main>

      {/* TOC */}
      {headings.length > 0 && (
        <aside className="w-[200px] flex-shrink-0 h-[calc(100vh-60px)] sticky top-[60px] py-10 px-4 overflow-y-auto hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--faint)' }}>
            في الصفحة دي
          </div>
          <nav>
            {headings.map((h) => (
              <a key={h.id} href={`#${h.id}`}
                className="block text-[12px] py-[5px] px-3 border-l-2 transition-all hover:text-blue-600 hover:border-blue-400"
                style={{ color: 'var(--muted)', borderColor: 'var(--border)', paddingLeft: `${(h.level - 2) * 12 + 12}px` }}
                onClick={(e) => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' }) }}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  )
}
