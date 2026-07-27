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
          background: 'rgba(15,23,42,.45)',
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-white rounded-lg p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--ink)' }}>
            Admin Access Required
          </h3>
          <p style={{ color: 'var(--ink-2)' }} className="mb-4">
            You need to login as admin to create or edit articles.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--ink-2)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onShowAuth}
              className="flex-1 px-4 py-2 rounded text-white"
              style={{ backgroundColor: 'var(--blue-600)' }}
            >
              Login
            </button>
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
      onUpdate({
        ...article,
        title,
        category,
        content,
      })
    } else {
      onCreate({
        title,
        category,
        content,
      })
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-6"
      style={{
        background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] max-h-[88vh] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-[22px] py-[18px] border-b flex items-center gap-[10px]"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
            {article ? 'Edit Article' : 'Create New Article'}
          </h3>
          <button
            onClick={onClose}
            className="ml-auto text-xl"
            style={{ color: 'var(--ink)' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 px-[22px] py-[22px] overflow-y-auto"
          style={{ background: 'var(--surface)' }}
        >
          {/* Title */}
          <div className="mb-[18px]">
            <label
              className="block text-[12.5px] font-semibold mb-[7px]"
              style={{ color: 'var(--ink-2)' }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-[7px] text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--ink)',
                background: 'var(--surface)',
              }}
              placeholder="Article title"
            />
          </div>

          {/* Category */}
          <div className="mb-[18px]">
            <label
              className="block text-[12.5px] font-semibold mb-[7px]"
              style={{ color: 'var(--ink-2)' }}
            >
              Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as
                    | 'المشاريع'
                    | 'الإجراءات'
                    | 'الشركة'
                    | 'أسئلة شائعة'
                )
              }
              className="w-full px-3 py-2 border rounded-[7px] text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
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
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setTab('write')}
              className="px-3 py-[6px] rounded-[7px] text-[12.5px] font-semibold transition-all"
              style={{
                color:
                  tab === 'write' ? 'var(--blue-700)' : 'var(--muted)',
                background:
                  tab === 'write' ? 'var(--blue-50)' : 'transparent',
              }}
            >
              Write
            </button>
            <button
              onClick={() => setTab('preview')}
              className="px-3 py-[6px] rounded-[7px] text-[12.5px] font-semibold transition-all"
              style={{
                color:
                  tab === 'preview' ? 'var(--blue-700)' : 'var(--muted)',
                background:
                  tab === 'preview' ? 'var(--blue-50)' : 'transparent',
              }}
            >
              Preview
            </button>
          </div>

          {/* Content */}
          {tab === 'write' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-[7px] font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 resize-none"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--ink)',
                background: 'var(--surface)',
                fontFamily: 'var(--font-mono)',
                minHeight: '240px',
                lineHeight: '1.6',
              }}
              placeholder="Write your content in Markdown..."
            />
          ) : (
            <div
              className="border rounded-[7px] p-4 prose"
              style={{
                borderColor: 'var(--border)',
                minHeight: '240px',
                background: 'var(--surface-2)',
              }}
            >
              <div
                className="text-[15.5px]"
                style={{ color: 'var(--ink-2)' }}
              >
                {content ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <p style={{ color: 'var(--faint)' }}>
                    Preview will appear here...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-[22px] py-4 border-t flex gap-[10px] justify-end"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <button
            onClick={onClose}
            className="px-[18px] py-[10px] rounded-[7px] text-[13.5px] font-semibold border"
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
            className="px-5 py-[10px] rounded-[7px] text-white text-[13.5px] font-semibold flex items-center gap-[7px]"
            style={{ backgroundColor: 'var(--blue-600)' }}
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
            <h2
              key={idx}
              className="text-xl font-bold mt-4 mb-2"
              style={{ color: 'var(--ink)' }}
            >
              {line.replace(/^## /, '')}
            </h2>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-base font-semibold mt-3 mb-1"
              style={{ color: 'var(--ink)' }}
            >
              {line.replace(/^### /, '')}
            </h3>
          )
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-2" />
        }
        return (
          <p key={idx} className="mb-2">
            {line}
          </p>
        )
      })}
    </>
  )
}
