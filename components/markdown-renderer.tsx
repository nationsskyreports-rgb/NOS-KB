'use client'

import { useMemo, useState } from 'react'
import type { JSX } from 'react'

interface RenderMarkdownProps {
  content: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className="ml-auto flex items-center gap-[6px] px-3 py-1 rounded-lg text-[11.5px] font-semibold transition-all duration-200"
      style={{
        color: copied ? '#3fb950' : '#7d8590',
        fontFamily: 'var(--font-mono)',
        background: copied ? 'rgba(63,185,80,.1)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,.06)'
      }}
      onMouseLeave={(e) => {
        if (!copied) e.currentTarget.style.background = 'transparent'
      }}
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? '✅ Copied!' : '📋 Copy'}
    </button>
  )
}

export default function RenderMarkdown({ content }: RenderMarkdownProps) {
  const elements = useMemo(() => {
    const result: JSX.Element[] = []
    let id = 0
    let codeBlockId = 0
    let i = 0
    const lines = content.split('\n')

    while (i < lines.length) {
      const line = lines[i]

      // Code blocks
      if (line.startsWith('```')) {
        const lang = line.slice(3).trim() || 'text'
        i++
        const codeLines: string[] = []
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i])
          i++
        }
        i++

        const codeText = codeLines.join('\n')
        result.push(
          <div
            key={`code-${codeBlockId++}`}
            className="my-6 rounded-2xl overflow-hidden"
            style={{
              background: 'var(--code-bg)',
              boxShadow: '0 4px 20px rgba(0,0,0,.15), 0 2px 6px rgba(0,0,0,.1)',
              border: '1px solid rgba(255,255,255,.06)',
            }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ background: 'var(--code-bar)', borderColor: 'rgba(255,255,255,.06)' }}
            >
              {/* Traffic lights */}
              <div className="flex gap-[6px]">
                <div className="w-[10px] h-[10px] rounded-full" style={{ background: '#ff5f57' }} />
                <div className="w-[10px] h-[10px] rounded-full" style={{ background: '#febc2e' }} />
                <div className="w-[10px] h-[10px] rounded-full" style={{ background: '#28c840' }} />
              </div>
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2 py-[2px] rounded-md"
                style={{
                  color: '#adbac7',
                  background: 'rgba(255,255,255,.05)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {lang}
              </span>
              <CopyButton text={codeText} />
            </div>
            <pre
              className="m-0 p-5 overflow-x-auto"
              style={{
                background: 'var(--code-bg)',
                color: '#adbac7',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: '1.7',
              }}
            >
              <code>{codeText}</code>
            </pre>
          </div>
        )
        continue
      }

      // H1
      if (line.startsWith('# ') && !line.startsWith('## ')) {
        const text = line.replace(/^# /, '')
        result.push(
          <h1
            key={`h1-${id++}`}
            className="text-[28px] font-extrabold leading-tight mb-4 mt-8 pt-2"
            style={{ color: 'var(--ink)', letterSpacing: '-0.5px' }}
          >
            {renderInlineMarkdown(text)}
          </h1>
        )
        i++
        continue
      }

      // H2
      if (line.startsWith('## ') && !line.startsWith('### ')) {
        const text = line.replace(/^## /, '')
        const headingId = text.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, '').replace(/\s+/g, '-')
        result.push(
          <h2
            key={`h2-${id++}`}
            id={headingId}
            className="text-[22px] font-bold leading-tight mb-4 mt-10 pt-2 pb-3 border-b-2 flex items-center gap-3"
            style={{ color: 'var(--ink)', letterSpacing: '-0.3px', borderColor: 'var(--border)' }}
          >
            <div
              className="w-1 h-6 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(180deg, #6366f1, #2563eb)' }}
            />
            {renderInlineMarkdown(text)}
          </h2>
        )
        i++
        continue
      }

      // H3
      if (line.startsWith('### ')) {
        const text = line.replace(/^### /, '')
        const headingId = text.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, '').replace(/\s+/g, '-')
        result.push(
          <h3
            key={`h3-${id++}`}
            id={headingId}
            className="text-[17px] font-semibold mb-3 mt-7"
            style={{ color: 'var(--ink)' }}
          >
            {renderInlineMarkdown(text)}
          </h3>
        )
        i++
        continue
      }

      // Table
      if (line.includes('|') && line.trim().startsWith('|')) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
          if (!lines[i].match(/^\|\s*[-:]+/)) {
            tableLines.push(lines[i])
          }
          i++
        }
        if (tableLines.length > 0) {
          const parseRow = (r: string) => r.split('|').filter(c => c.trim()).map(c => c.trim())
          const headers = parseRow(tableLines[0])
          const rows = tableLines.slice(1).map(parseRow)
          result.push(
            <div
              key={`table-${id++}`}
              className="my-6 overflow-x-auto rounded-xl"
              style={{
                border: '1px solid var(--border)',
                boxShadow: 'var(--sh-sm)',
              }}
            >
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #f5f7fa, #eef4ff)' }}>
                    {headers.map((h, hi) => (
                      <th
                        key={hi}
                        className="px-4 py-3 text-left font-bold border-b"
                        style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr
                      key={ri}
                      style={{ background: ri % 2 === 1 ? 'var(--surface-2)' : 'var(--surface)' }}
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-4 py-3 border-b"
                          style={{ borderColor: 'var(--border)', color: 'var(--ink-2)' }}
                        >
                          {renderInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        continue
      }

      // Lists
      if (line.startsWith('- ')) {
        const listItems: string[] = []
        while (i < lines.length && lines[i].startsWith('- ')) {
          listItems.push(lines[i].replace(/^- /, ''))
          i++
        }
        result.push(
          <ul key={`ul-${id++}`} className="ml-1 mb-4 space-y-2" style={{ color: 'var(--ink-2)' }}>
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 leading-relaxed">
                <div
                  className="w-[6px] h-[6px] rounded-full mt-[9px] flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #2563eb)' }}
                />
                <span>{renderInlineMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        )
        continue
      }

      // Numbered lists
      if (/^\d+[\.\)]\s/.test(line)) {
        const listItems: string[] = []
        while (i < lines.length && /^\d+[\.\)]\s/.test(lines[i])) {
          listItems.push(lines[i].replace(/^\d+[\.\)]\s/, ''))
          i++
        }
        result.push(
          <ol key={`ol-${id++}`} className="ml-1 mb-4 space-y-2" style={{ color: 'var(--ink-2)' }}>
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 leading-relaxed">
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-[2px] text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #2563eb)' }}
                >
                  {idx + 1}
                </span>
                <span className="pt-[2px]">{renderInlineMarkdown(item)}</span>
              </li>
            ))}
          </ol>
        )
        continue
      }

      // Blockquote / callout
      if (line.startsWith('> ')) {
        const calloutLines: string[] = []
        while (i < lines.length && lines[i].startsWith('> ')) {
          calloutLines.push(lines[i].replace(/^> /, ''))
          i++
        }
        result.push(
          <div
            key={`callout-${id++}`}
            className="flex gap-3 p-5 rounded-xl my-6"
            style={{
              background: 'linear-gradient(135deg, #eef4ff, #f5f0ff)',
              border: '1px solid var(--blue-100)',
              boxShadow: '0 2px 8px rgba(99,102,241,.06)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #2563eb)' }}
            >
              💡
            </div>
            <div className="text-[14px] leading-relaxed pt-1" style={{ color: 'var(--blue-800)' }}>
              {calloutLines.map((text, idx) => (
                <p key={idx}>{renderInlineMarkdown(text)}</p>
              ))}
            </div>
          </div>
        )
        continue
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        result.push(
          <div key={`hr-${id++}`} className="my-10 flex items-center gap-4">
            <div className="flex-1 h-[1px]" style={{ background: 'var(--border)' }} />
            <div className="flex gap-1">
              <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#6366f1', opacity: .4 }} />
              <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#2563eb', opacity: .3 }} />
              <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#06b6d4', opacity: .2 }} />
            </div>
            <div className="flex-1 h-[1px]" style={{ background: 'var(--border)' }} />
          </div>
        )
        i++
        continue
      }

      // Paragraph
      if (line.trim()) {
        result.push(
          <p key={`p-${id++}`} className="mb-4 leading-[1.8]" style={{ color: 'var(--ink-2)' }}>
            {renderInlineMarkdown(line)}
          </p>
        )
      }

      i++
    }

    return result
  }, [content])

  return <div>{elements}</div>
}

function renderInlineMarkdown(text: string): JSX.Element | string {
  const parts: (JSX.Element | string)[] = []
  let lastIndex = 0

  const regex = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|__([^_]+)__/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      parts.push(
        <strong key={`s-${parts.length}`} style={{ color: 'var(--ink)', fontWeight: 650 }}>
          {match[1]}
        </strong>
      )
    } else if (match[2]) {
      parts.push(
        <code
          key={`c-${parts.length}`}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '13px',
            background: 'linear-gradient(135deg, #eef4ff, #f0f0ff)',
            color: 'var(--blue-700)',
            padding: '2px 7px', borderRadius: '6px', border: '1px solid var(--blue-100)',
          }}
        >
          {match[2]}
        </code>
      )
    } else if (match[3]) {
      parts.push(
        <a
          key={`a-${parts.length}`}
          href={match[4]}
          target="_blank"
          rel="noopener noreferrer"
          className="link"
          style={{
            color: 'var(--blue-600)', fontWeight: 500,
            textDecoration: 'underline',
            textDecorationColor: 'var(--blue-200)',
            textUnderlineOffset: '3px',
          }}
        >
          {match[3]}
        </a>
      )
    } else if (match[5]) {
      parts.push(
        <strong key={`u-${parts.length}`} style={{ color: 'var(--ink)', fontWeight: 650 }}>
          {match[5]}
        </strong>
      )
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : text
}
