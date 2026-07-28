'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/lib/storage'

interface EditorModalProps {
  open: boolean
  article: Article | null
  onClose: () => void
  onCreate: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (article: Article) => void
  onShowAuth: () => void
  isAdmin: boolean
}

export default function EditorModal({
  open,
  article,
  onClose,
  onCreate,
  onUpdate,
  onShowAuth,
  isAdmin,
}: EditorModalProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<
    'المشاريع' | 'الإجراءات' | 'الشركة' | 'أسئلة شائعة'
  >('المشاريع')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (article) {
      setTitle(article.title)
      setCategory(article.category)
      setContent(article.content)
    } else {
      setTitle('')
      setCategory('المشاريع')
      setContent('')
    }
    setTab('write')
  }, [article, open])

  if (!open) return null

  if (!isAdmin) {
    return (
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-6"
        style={{
          background: 'rgba(15,23,42,.5)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden animate-pop"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            boxShadow: 'var(--sh-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #6366f1, #2563eb)' }} />
          <div className="p-7">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #eef4ff, #f0f0ff)',
                border: '1px solid var(--blue-100)',
              }}
            >
              🔒
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--ink)' }}>
              Admin Access Required
            </h3>
            <p style={{ color: 'var(--ink-2)' }} className="mb-6 text-[14px]">
              You need to login as admin to create or edit articles.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-[10px] border rounded-xl text-[13.5px] font-semibold transition-all duration-200 hover:bg-gray-50"
                style={{ borderColor: 'var(--border)', color: 'var(--ink-2)' }}
              >
                Cancel
              </button>
              <button
                onClick={onShowAuth}
                className="flex-1 px-4 py-[10px] rounded-xl text-white text-[13.5px] font-semibold transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #2563eb)',
                  boxShadow: '0 2px 10px rgba(99,102,241,.3)',
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required')
      return
    }

    if (article) {
      onUpdate({ ...article, title, category, content })
    } else {
      onCreate({ title, category, content })
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-6"
      style={{
        background: 'rgba(15,23,42,.5)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[740px] max-h-[88vh] rounded-2xl flex flex-col overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          boxShadow: 'var(--sh-lg)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Gradient accent */}
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #6366f1, #2563eb, #06b6d4)' }} />

        {/* Header */}
        <div
          className="px-6 py-5 border-b flex items-center gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: 'linear-gradient(135deg, #eef4ff, #f0f0ff)',
              border: '1px solid var(--blue-100)',
            }}
          >
            {article ? '✏️' : '✨'}
          </div>
          <h3 className="text-[16px] font-bold" style={{ color: 'var(--ink)' }}>
            {article ? 'Edit Article' : 'Create New Article'}
          </h3>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-200 hover:bg-gray-100"
            style={{ color: 'var(--muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 px-6 py-5 overflow-y-auto"
          style={{ background: 'var(--surface-2)' }}
        >
          {/* Title */}
          <div className="mb-5">
            <label className="block text-[12.5px] font-bold mb-2" style={{ color: 'var(--ink-2)' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-[10px] border rounded-xl text-sm transition-all duration-200"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--ink)',
                background: 'var(--surface)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              placeholder="Article title"
            />
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="block text-[12.5px] font-bold mb-2" style={{ color: 'var(--ink-2)' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as 'المشاريع' | 'الإجراءات' | 'الشركة' | 'أسئلة شائعة')
              }
              className="w-full px-4 py-[10px] border rounded-xl text-sm transition-all duration-200"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--ink)',
                background: 'var(--surface)',
              }}
            >
              <option>المشاريع</option>
              <option>الإجراءات</option>
              <option>الشركة</option>
              <option>أسئلة شائعة</option>
            </select>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 mb-4 p-1 rounded-xl w-fit"
            style={{ background: 'var(--surface)' }}
          >
            <button
              onClick={() => setTab('write')}
              className="px-4 py-[7px] rounded-lg text-[12.5px] font-semibold transition-all duration-200"
              style={{
                color: tab === 'write' ? '#fff' : 'var(--muted)',
                background: tab === 'write' ? 'linear-gradient(135deg, #6366f1, #2563eb)' : 'transparent',
                boxShadow: tab === 'write' ? '0 2px 8px rgba(99,102,241,.25)' : 'none',
              }}
            >
              ✍️ Write
            </button>
            <button
              onClick={() => setTab('preview')}
              className="px-4 py-[7px] rounded-lg text-[12.5px] font-semibold transition-all duration-200"
              style={{
                color: tab === 'preview' ? '#fff' : 'var(--muted)',
                background: tab === 'preview' ? 'linear-gradient(135deg, #6366f1, #2563eb)' : 'transparent',
                boxShadow: tab === 'preview' ? '0 2px 8px rgba(99,102,241,.25)' : 'none',
              }}
            >
              👁️ Preview
            </button>
          </div>

          {/* Content */}
          {tab === 'write' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl text-sm resize-none transition-all duration-200"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--ink)',
                background: 'var(--surface)',
                fontFamily: 'var(--font-mono)',
                minHeight: '260px',
                lineHeight: '1.7',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              placeholder="Write your content in Markdown..."
            />
          ) : (
            <div
              className="border rounded-xl p-5 prose"
              style={{
                borderColor: 'var(--border)',
                minHeight: '260px',
                background: 'var(--surface)',
              }}
            >
              <div className="text-[15.5px]" style={{ color: 'var(--ink-2)' }}>
                {content ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <p style={{ color: 'var(--faint)' }}>Preview will appear here...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex gap-3 justify-end"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
          }}
        >
          <button
            onClick={onClose}
            className="px-5 py-[10px] rounded-xl text-[13.5px] font-semibold border transition-all duration-200 hover:bg-gray-50"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--ink-2)',
              background: 'var(--white)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-[10px] rounded-xl text-white text-[13.5px] font-semibold flex items-center gap-2 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              boxShadow: '0 2px 10px rgba(99,102,241,.3)',
            }}
          >
            💾 {article ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <>
      {lines.map((line, idx) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-xl font-bold mt-4 mb-2" style={{ color: 'var(--ink)' }}>
              {line.replace(/^## /, '')}
            </h2>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base font-semibold mt-3 mb-1" style={{ color: 'var(--ink)' }}>
              {line.replace(/^### /, '')}
            </h3>
          )
        }
        if (line.trim() === '') return <div key={idx} className="h-2" />
        return <p key={idx} className="mb-2">{line}</p>
      })}
    </>
  )
}
