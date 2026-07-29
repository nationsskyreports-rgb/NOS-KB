'use client'

import { Article, ArticleManager } from '@/lib/storage'

interface SidebarProps {
  articles: Article[]
  selectedArticleId: string | null
  onSelectArticle: (id: string) => void
  onNewArticle: () => void
}

const CATEGORY_STYLE: Record<string, { color: string; gradient: string; emoji: string }> = {
  'المشاريع':      { color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)', emoji: '🏗️' },
  'الإجراءات':     { color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', emoji: '📋' },
  'الشركة':        { color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)', emoji: '🏢' },
  'أسئلة شائعة':   { color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', emoji: '❓' },
}

function isRecent(ts: number) { return Date.now() - ts < 7 * 24 * 60 * 60 * 1000 }

export default function Sidebar({ articles, selectedArticleId, onSelectArticle, onNewArticle }: SidebarProps) {
  const manager = new ArticleManager()
  const categories = manager.getCategories()

  return (
    <aside
      className="w-[280px] flex-shrink-0 h-[calc(100vh-60px)] sticky top-[60px] overflow-y-auto border-r px-3 py-5 pb-10"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {categories.map((category) => {
        const categoryArticles = articles.filter((a) => a.category === category)
        if (categoryArticles.length === 0) return null
        const style = CATEGORY_STYLE[category] || { color: '#64748b', gradient: '#64748b', emoji: '📄' }

        return (
          <div key={category} className="mb-[20px]">
            {/* Category header card */}
            <div
              className="flex items-center gap-[8px] px-[10px] py-[6px] rounded-[8px] mb-[6px]"
              style={{ background: style.color + '0a' }}
            >
              <div
                className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[11px]"
                style={{ background: style.gradient, color: 'white', fontSize: '12px' }}
              >
                {style.emoji}
              </div>
              <span className="text-[12px] font-bold" style={{ color: style.color }}>
                {category}
              </span>
              <span
                className="ml-auto text-[10px] font-bold w-[20px] h-[20px] rounded-full flex items-center justify-center"
                style={{ background: style.color + '15', color: style.color }}
              >
                {categoryArticles.length}
              </span>
            </div>

            {/* Articles */}
            {categoryArticles.map((article) => {
              const selected = selectedArticleId === article.id
              const recent = isRecent(article.updatedAt)
              return (
                <button
                  key={article.id}
                  onClick={() => onSelectArticle(article.id)}
                  className="w-full flex items-center gap-[8px] px-[10px] py-[8px] rounded-[8px] text-[13px] transition-all duration-150 group relative"
                  style={{
                    color: selected ? 'var(--blue-700)' : 'var(--ink-2)',
                    background: selected ? 'var(--blue-50)' : 'transparent',
                    fontWeight: selected ? 600 : 450,
                    boxShadow: selected ? '0 1px 3px rgba(37,99,235,.1)' : 'none',
                  }}
                >
                  {selected && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-full"
                      style={{ background: style.gradient }}
                    />
                  )}
                  <span className="text-[13px] w-4 text-center flex-shrink-0 opacity-80">
                    {article.icon || style.emoji}
                  </span>
                  <span className="flex-1 text-left truncate">{article.title}</span>
                  {recent && (
                    <span
                      className="w-[8px] h-[8px] rounded-full flex-shrink-0 animate-pulse"
                      style={{ background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,.4)' }}
                      title="تم التحديث مؤخراً"
                    />
                  )}
                </button>
              )
            })}
          </div>
        )
      })}
    </aside>
  )
}
