'use client'

import { Article, ArticleManager } from '@/lib/storage'

interface SidebarProps {
  articles: Article[]
  selectedArticleId: string | null
  onSelectArticle: (id: string) => void
  onNewArticle: () => void
}

const CATEGORY_META: Record<string, { gradient: string; emoji: string; glow: string }> = {
  'المشاريع':    { gradient: 'linear-gradient(135deg, #6366f1, #2563eb)', emoji: '🏗️', glow: 'rgba(99,102,241,.4)' },
  'الإجراءات':   { gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', emoji: '⚙️', glow: 'rgba(245,158,11,.4)' },
  'الشركة':      { gradient: 'linear-gradient(135deg, #10b981, #06b6d4)', emoji: '🏢', glow: 'rgba(16,185,129,.4)' },
  'أسئلة شائعة': { gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', emoji: '❓', glow: 'rgba(139,92,246,.4)' },
}

export default function Sidebar({
  articles,
  selectedArticleId,
  onSelectArticle,
  onNewArticle,
}: SidebarProps) {
  const manager = new ArticleManager()
  const categories = manager.getCategories()

  return (
    <aside
      className="w-[280px] flex-shrink-0 h-[calc(100vh-64px)] sticky top-[64px] overflow-y-auto p-4 pb-10 dark-scrollbar"
      style={{
        background: 'linear-gradient(195deg, #0f172a 0%, #1e293b 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-4 mb-1">
        <span className="text-[20px]">📚</span>
        <span
          className="text-[13px] font-bold tracking-wide"
          style={{ color: 'rgba(255,255,255,.5)' }}
        >
          المحتوى
        </span>
      </div>

      <div className="stagger-children">
        {categories.map((category) => {
          const categoryArticles = articles.filter((a) => a.category === category)
          if (categoryArticles.length === 0) return null

          const meta = CATEGORY_META[category] || CATEGORY_META['المشاريع']

          return (
            <div key={category} className="mb-5 animate-slideInLeft">
              {/* Category Header */}
              <div className="flex items-center gap-[10px] px-3 pb-2 mb-[6px]">
                <div
                  className="w-[22px] h-[22px] rounded-lg flex items-center justify-center text-[11px]"
                  style={{
                    background: meta.gradient,
                    boxShadow: `0 2px 8px ${meta.glow}`,
                  }}
                >
                  {meta.emoji}
                </div>
                <span
                  className="text-[12px] font-bold uppercase tracking-wider flex-1"
                  style={{ color: 'rgba(255,255,255,.45)' }}
                >
                  {category}
                </span>
                <span
                  className="text-[11px] font-bold px-[8px] py-[2px] rounded-full"
                  style={{
                    background: 'rgba(255,255,255,.08)',
                    color: 'rgba(255,255,255,.35)',
                  }}
                >
                  {categoryArticles.length}
                </span>
              </div>

              {/* Article Items */}
              {categoryArticles.map((article) => {
                const isActive = selectedArticleId === article.id
                return (
                  <button
                    key={article.id}
                    onClick={() => onSelectArticle(article.id)}
                    className="w-full flex items-center gap-[10px] px-3 py-[9px] rounded-xl text-[13.5px] font-medium transition-all duration-150 group relative"
                    style={{
                      color: isActive ? '#fff' : 'rgba(226,232,240,.75)',
                      background: isActive
                        ? 'rgba(99,102,241,.2)'
                        : 'transparent',
                      fontWeight: isActive ? 600 : 450,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,.06)'
                        e.currentTarget.style.color = '#fff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'rgba(226,232,240,.75)'
                      }
                    }}
                  >
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                        style={{ background: meta.gradient, boxShadow: `0 0 8px ${meta.glow}` }}
                      />
                    )}
                    <span className="text-[14px] opacity-80 w-4 text-center flex-shrink-0">
                      {article.icon || '📄'}
                    </span>
                    <span className="flex-1 text-left truncate">{article.title}</span>
                    {Date.now() - article.updatedAt < 7 * 24 * 60 * 60 * 1000 && (
                      <span
                        className="text-[9px] font-bold px-[6px] py-[2px] rounded-full flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                          color: '#fff',
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Add New (admin-only, hidden by default) */}
      <button
        onClick={onNewArticle}
        className="w-full flex items-center gap-2 px-3 py-[9px] rounded-xl text-[13px] font-semibold border border-dashed mt-4 transition-all duration-200 hidden"
        style={{
          color: 'rgba(99,102,241,.7)',
          borderColor: 'rgba(99,102,241,.25)',
        }}
        id="nav-add"
      >
        <span>+</span>
        <span>Add Article</span>
      </button>
    </aside>
  )
}
