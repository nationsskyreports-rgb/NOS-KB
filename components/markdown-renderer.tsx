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
      className="ml-auto flex items-center gap-[6px] px-[9px] py-1 rounded text-[11.5px] font-semibold transition-all hover:bg-[#21262d]"
      style={{ color: copied ? '#3fb950' : '#7d8590', fontFamily: 'var(--font-mono)' }}
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
        i++ // Skip closing ```

        const codeText = codeLines.join('\n')
        result.push(
          <div
            key={`code-${codeBlockId++}`}
            className="my-[22px] rounded-[10px] overflow-hidden border shadow"
            style={{ borderColor: '#1f2733', background: 'var(--code-bg)' }}
          >
            <div
              className="flex items-center gap-[10px] px-[14px] py-[9px] border-b"
              style={{ background: 'var(--code-bar)', borderColor: '#21262d' }}
            >
              <span
                className="text-[11.5px] font-semibold uppercase tracking-wider"
                style={{ color: '#7d8590', fontFamily: 'var(--font-mono)' }}
              >
                {lang}
              </span>
              <CopyButton text={codeText} />
            </div>
            <pre
              className="m-0 p-4 overflow-x-auto"
              style={{
                background: 'var(--code-bg)',
                color: '#adbac7',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: '1.65',
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
            className="text-[28px] font-extrabold leading-tight mb-[16px] mt-[32px] pt-[6px]"
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
            className="text-[21px] font-bold leading-tight mb-[14px] mt-[38px] pt-[6px]"
            style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}
          >
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
            className="text-[16.5px] font-semibold mb-[10px] mt-[26px]"
            style={{ color: 'var(--ink)' }}
          >
            {renderInlineMarkdown(text)}
          </h3>
        )
        i++
        continue
      }

      // Table (simple | based)
      if (line.includes('|') && line.trim().startsWith('|')) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
          if (!lines[i].match(/^\|\s*[-:]+/)) { // skip separator rows
            tableLines.push(lines[i])
          }
          i++
        }
        if (tableLines.length > 0) {
          const parseRow = (r: string) => r.split('|').filter(c => c.trim()).map(c => c.trim())
          const headers = parseRow(tableLines[0])
          const rows = tableLines.slice(1).map(parseRow)
          result.push(
            <div key={`table-${id++}`} className="my-5 overflow-x-auto rounded-[10px] border" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {headers.map((h, hi) => (
                      <th key={hi} className="px-4 py-2 text-left font-semibold border-b" style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)', color: 'var(--ink-2)' }}>{renderInlineMarkdown(cell)}</td>
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
          <ul key={`ul-${id++}`} className="ml-[22px] mb-[15px] list-disc" style={{ color: 'var(--ink-2)' }}>
            {listItems.map((item, idx) => (
              <li key={idx} className="mb-[7px] leading-relaxed">{renderInlineMarkdown(item)}</li>
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
          <ol key={`ol-${id++}`} className="ml-[22px] mb-[15px] list-decimal" style={{ color: 'var(--ink-2)' }}>
            {listItems.map((item, idx) => (
              <li key={idx} className="mb-[7px] leading-relaxed">{renderInlineMarkdown(item)}</li>
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
            className="flex gap-3 p-4 rounded-[10px] border my-5"
            style={{ background: 'var(--blue-50)', borderColor: 'var(--blue-100)', color: 'var(--blue-800)' }}
          >
            <span className="text-base flex-shrink-0">💡</span>
            <div className="text-[14px] leading-relaxed">
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
        result.push(<hr key={`hr-${id++}`} className="my-8 border-t" style={{ borderColor: 'var(--border)' }} />)
        i++
        continue
      }

      // Paragraph
      if (line.trim()) {
        result.push(
          <p key={`p-${id++}`} className="mb-[15px] leading-[1.75]" style={{ color: 'var(--ink-2)' }}>
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
            background: 'var(--blue-50)', color: 'var(--blue-700)',
            padding: '2px 6px', borderRadius: '5px', border: '1px solid var(--blue-100)',
          }}
        >
          {match[2]}
        </code>
      )
    } else if (match[3]) {
      parts.push(
        <a key={`a-${parts.length}`} href={match[4]} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--blue-600)', fontWeight: 500, borderBottom: '1px solid var(--blue-200)' }}
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
