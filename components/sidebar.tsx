'use client'

import { Article, ArticleManager } from '@/lib/storage'

interface SidebarProps {
  articles: Article[]
  selectedArticleId: string | null
  onSelectArticle: (id: string) => void
  onNewArticle: () => void
}

const CATEGORY_COLORS = {
  'SQL & Database': '#8b5cf6',
  'Scripts': '#2563eb',
  'Guides': '#10b981',
  'Config': '#f59e0b',
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
      className="w-[280px] flex-shrink-0 h-[calc(100vh-60px)] sticky top-[60px] overflow-y-auto border-r p-5 pb-10"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface)',
      }}
    >
      {categories.map((category) => {
        const categoryArticles = articles.filter((a) => a.category === category)
        if (categoryArticles.length === 0) return null

        return (
          <div key={category} className="mb-[22px]">
            {/* Category Header */}
            <div
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide px-[10px] pb-2 mb-2"
              style={{ color: 'var(--faint)' }}
            >
              <div
                className="w-[7px] h-[7px] rounded-[3px]"
                style={{ background: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] }}
              />
              <span>{category}</span>
              <span
                className="ml-auto text-[10.5px] font-semibold px-[7px] py-[1px] rounded-full"
                style={{
                  color: 'var(--faint)',
                  background: 'var(--surface-2)',
                }}
              >
                {categoryArticles.length}
              </span>
            </div>

            {/* Article Items */}
            {categoryArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => onSelectArticle(article.id)}
                className="w-full flex items-center gap-[9px] px-[10px] py-[7px] rounded-[7px] text-[13.5px] font-medium transition-all hover:bg-surface-2"
                style={{
                  color:
                    selectedArticleId === article.id
                      ? 'var(--blue-700)'
                      : 'var(--ink-2)',
                  background:
                    selectedArticleId === article.id
                      ? 'var(--blue-50)'
                      : 'transparent',
                  fontWeight: selectedArticleId === article.id ? 600 : 450,
                  position: 'relative',
                }}
              >
                {selectedArticleId === article.id && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-[3px]"
                    style={{ background: 'var(--blue-600)' }}
                  />
                )}
                <span className="text-[14px] opacity-85 w-4 text-center">📄</span>
                <span className="flex-1 text-left truncate">{article.title}</span>
              </button>
            ))}
          </div>
        )
      })}

      {/* Add New Button (admin only) */}
      <button
        onClick={onNewArticle}
        className="w-full flex items-center gap-2 px-[10px] py-[7px] rounded-[7px] text-[13px] font-semibold border-2 border-dashed mt-4 transition-all hover:bg-blue-50 hidden"
        style={{
          color: 'var(--blue-600)',
          borderColor: 'var(--blue-200)',
        }}
        id="nav-add"
      >
        <span>+</span>
        <span>Add Article</span>
      </button>
    </aside>
  )
}
