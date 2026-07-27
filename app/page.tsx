'use client'

import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/topbar'
import Sidebar from '@/components/sidebar'
import MainContent from '@/components/main-content'
import CommandPalette from '@/components/command-palette'
import EditorModal from '@/components/editor-modal'
import { Article, ArticleManager } from '@/lib/storage'
import { verifyEditKey, clearEditKey } from '@/lib/supabase'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authError, setAuthError] = useState('')

  // Initialize articles from storage and restore admin state
  useEffect(() => {
    const initializeApp = async () => {
      const manager = new ArticleManager()
      // Supabase is the source of truth — pull the latest list.
      const allArticles = await manager.loadArticlesFromSupabase()
      setArticles(allArticles)

      if (allArticles.length > 0 && !selectedArticleId) {
        setSelectedArticleId(allArticles[0].id)
      }
      // Editing stays locked until the passphrase is entered
      // (the key is never persisted, so every visit starts read-only).
    }

    initializeApp()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowPalette(true)
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowPalette(false)
        setShowEditor(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleArticleCreate = useCallback(async (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const manager = new ArticleManager()
      const newArticle = await manager.createArticleAsync(article)
      setArticles(manager.getAllArticles())
      setSelectedArticleId(newArticle.id)
      setShowEditor(false)
      setEditingArticle(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    }
  }, [])

  const handleArticleUpdate = useCallback(async (updated: Article) => {
    try {
      const manager = new ArticleManager()
      await manager.updateArticleAsync(updated.id, updated)
      setArticles(manager.getAllArticles())
      setSelectedArticleId(updated.id)
      setShowEditor(false)
      setEditingArticle(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }, [])

  const handleArticleDelete = useCallback(async (id: string) => {
    try {
      const manager = new ArticleManager()
      await manager.deleteArticleAsync(id)
      const remaining = manager.getAllArticles()
      setArticles(remaining)
      if (selectedArticleId === id && remaining.length > 0) {
        setSelectedArticleId(remaining[0].id)
      } else if (remaining.length === 0) {
        setSelectedArticleId(null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }, [selectedArticleId])

  const handleLoginClick = () => {
    setShowAuthModal(true)
  }

  // Unlock editing with the shared passphrase (verified against the DB).
  const handleAdminLogin = async (_email: string, password: string) => {
    setAuthError('')
    const ok = await verifyEditKey(password)
    if (!ok) {
      setAuthError('Wrong edit key')
      return
    }
    setIsAdmin(true)
    setShowAuthModal(false)
    setAuthError('')
  }

  const handleLogout = () => {
    clearEditKey()
    setIsAdmin(false)
  }

  const selectedArticle = articles.find((a) => a.id === selectedArticleId)

  // Update body class when admin status changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isAdmin) {
        document.body.classList.add('admin')
      } else {
        document.body.classList.remove('admin')
      }
    }
  }, [isAdmin])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg)' }}
    >

      <Topbar
        isAdmin={isAdmin}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogout}
        onSearchClick={() => setShowPalette(true)}
        onNewArticle={() => {
          setEditingArticle(null)
          setShowEditor(true)
        }}
      />

      <div className="flex flex-1">
        <Sidebar
          articles={articles}
          selectedArticleId={selectedArticleId}
          onSelectArticle={setSelectedArticleId}
          onNewArticle={() => {
            setEditingArticle(null)
            setShowEditor(true)
          }}
        />

        <MainContent
          article={selectedArticle}
          isAdmin={isAdmin}
          onEdit={() => {
            setEditingArticle(selectedArticle || null)
            setShowEditor(true)
          }}
          onDelete={() => {
            if (selectedArticleId && confirm('Delete this article?')) {
              handleArticleDelete(selectedArticleId)
            }
          }}
        />
      </div>

      {/* Modals */}
      <CommandPalette
        open={showPalette}
        articles={articles}
        onClose={() => setShowPalette(false)}
        onSelect={(article) => {
          setSelectedArticleId(article.id)
          setShowPalette(false)
        }}
      />

      <EditorModal
        open={showEditor}
        article={editingArticle}
        onClose={() => {
          setShowEditor(false)
          setEditingArticle(null)
        }}
        onCreate={handleArticleCreate}
        onUpdate={handleArticleUpdate}
        onShowAuth={() => setShowAuthModal(true)}
        isAdmin={isAdmin}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false)
            setAuthError('')
          }}
          onSubmit={handleAdminLogin}
          error={authError}
        />
      )}
    </div>
  )
}

function AuthModal({
  onClose,
  onSubmit,
  error,
}: {
  onClose: () => void
  onSubmit: (email: string, password: string) => void
  error?: string
}) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const handleSubmit = async () => {
    if (!password.trim()) return
    setIsLoading(true)
    await onSubmit('', password)
    setIsLoading(false)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-100"
      style={{
        background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-bold mb-2"
          style={{ color: 'var(--ink)' }}
        >
          Unlock editing
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
          Enter the edit key to add or change articles
        </p>

        {error && (
          <div
            className="mb-4 px-3 py-2 rounded text-sm border"
            style={{
              borderColor: '#fca5a5',
              background: '#fee2e2',
              color: '#991b1b',
            }}
          >
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="Edit key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) handleSubmit()
            }}
            className="w-full px-3 py-2 border rounded pr-12"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--ink)',
            }}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-sm"
            style={{ color: 'var(--muted)' }}
          >
            {showKey ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--ink-2)',
            }}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 rounded text-white"
            style={{ 
              backgroundColor: isLoading ? '#93c5fd' : 'var(--blue-600)',
              opacity: isLoading ? 0.7 : 1,
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
