'use client'

import { useMemo } from 'react'
import type { JSX } from 'react'

interface RenderMarkdownProps {
  content: string
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

        result.push(
          <div
            key={`code-${codeBlockId++}`}
            className="my-[22px] rounded-[10px] overflow-hidden border shadow"
            style={{
              borderColor: '#1f2733',
              background: 'var(--code-bg)',
            }}
          >
            <div
              className="flex items-center gap-[10px] px-[14px] py-[9px] border-b"
              style={{
                background: 'var(--code-bar)',
                borderColor: '#21262d',
              }}
            >
              <span
                className="text-[11.5px] font-semibold uppercase tracking-wider"
                style={{
                  color: '#7d8590',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {lang}
              </span>
              <button
                className="ml-auto flex items-center gap-[6px] px-[9px] py-1 rounded text-[11.5px] font-semibold transition-all hover:bg-[#21262d]"
                style={{
                  color: '#7d8590',
                  fontFamily: 'var(--font-mono)',
                }}
                onClick={() => {
                  navigator.clipboard.writeText(codeLines.join('\n'))
                }}
              >
                📋 Copy
              </button>
            </div>
            <pre
              className="m-0 p-4 text-sm leading-relaxed overflow-x-auto"
              style={{
                background: 'var(--code-bg)',
                color: '#adbac7',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: '1.65',
              }}
            >
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        )
        continue
      }

      // Headings
      if (line.startsWith('## ')) {
        const text = line.replace(/^## /, '')
        const headingId = text
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-')
        result.push(
          <h2
            key={`h2-${id++}`}
            id={headingId}
            className="text-[21px] font-bold leading-tight mb-[14px] mt-[38px] pt-[6px]"
            style={{
              color: 'var(--ink)',
              letterSpacing: '-0.3px',
            }}
          >
            {text}
          </h2>
        )
        i++
        continue
      }

      if (line.startsWith('### ')) {
        const text = line.replace(/^### /, '')
        const headingId = text
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-')
        result.push(
          <h3
            key={`h3-${id++}`}
            id={headingId}
            className="text-[16.5px] font-semibold mb-[10px] mt-[26px]"
            style={{
              color: 'var(--ink)',
            }}
          >
            {text}
          </h3>
        )
        i++
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
          <ul
            key={`ul-${id++}`}
            className="ml-[22px] mb-[15px]"
            style={{ color: 'var(--ink-2)' }}
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="mb-[7px]">
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        )
        continue
      }

      // Blockquote/callout
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
            style={{
              background: 'var(--blue-50)',
              borderColor: 'var(--blue-100)',
              color: 'var(--blue-800)',
            }}
          >
            <span className="text-4xl flex-shrink-0">💡</span>
            <div>
              {calloutLines.map((text, idx) => (
                <p key={idx}>{renderInlineMarkdown(text)}</p>
              ))}
            </div>
          </div>
        )
        continue
      }

      // Paragraph
      if (line.trim()) {
        result.push(
          <p
            key={`p-${id++}`}
            className="mb-[15px]"
            style={{ color: 'var(--ink-2)' }}
          >
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

  // Match patterns: **bold**, `code`, [link](url)
  const regex =
    /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|__([^_]+)__/g
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // **bold**
      parts.push(
        <strong key={`strong-${parts.length}`} style={{ color: 'var(--ink)' }}>
          {match[1]}
        </strong>
      )
    } else if (match[2]) {
      // `code`
      parts.push(
        <code
          key={`code-${parts.length}`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            background: 'var(--blue-50)',
            color: 'var(--blue-700)',
            padding: '2px 6px',
            borderRadius: '5px',
            border: '1px solid var(--blue-100)',
          }}
        >
          {match[2]}
        </code>
      )
    } else if (match[3]) {
      // [link](url)
      parts.push(
        <a
          key={`link-${parts.length}`}
          href={match[4]}
          className="link"
          style={{
            color: 'var(--blue-600)',
            fontWeight: 500,
            borderBottom: '1px solid var(--blue-200)',
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[3]}
        </a>
      )
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : text
}
