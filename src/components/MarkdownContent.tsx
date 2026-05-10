import { memo, useCallback, type MouseEvent, type ReactNode } from 'react'

interface MarkdownContentProps {
  content: string
  onWikilinkClick?: (target: string) => void
}

type InlineRenderer = (text: string, keyPrefix: string) => ReactNode[]
type InlineTokenType = 'code' | 'strong' | 'link' | 'wikilink'
type InlineToken = { index: number; match: RegExpExecArray; type: InlineTokenType }
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const headingTags: HeadingTag[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

function wikilinkParts(raw: string): { display: string; target: string } {
  const separator = raw.indexOf('|')
  if (separator === -1) return { display: raw, target: raw }
  return {
    target: raw.slice(0, separator),
    display: raw.slice(separator + 1),
  }
}

function nextInlineToken(text: string): InlineToken | null {
  const candidates: Array<{ match: RegExpExecArray | null; type: InlineTokenType }> = [
    { type: 'code' as const, match: /`([^`]+)`/u.exec(text) },
    { type: 'strong' as const, match: /\*\*([^*]+)\*\*/u.exec(text) },
    { type: 'link' as const, match: /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/u.exec(text) },
    { type: 'wikilink' as const, match: /\[\[([^\]]+)\]\]/u.exec(text) },
  ]
  let next: InlineToken | null = null

  for (const candidate of candidates) {
    if (!candidate.match) continue

    const token = {
      index: candidate.match.index,
      match: candidate.match,
      type: candidate.type,
    }
    if (!next || token.index < next.index) next = token
  }

  return next
}

function renderInline(text: string, onWikilinkClick: MarkdownContentProps['onWikilinkClick'], keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let rest = text
  let tokenIndex = 0
  const renderChild: InlineRenderer = (value, childKeyPrefix) => renderInline(value, onWikilinkClick, childKeyPrefix)

  while (rest) {
    const token = nextInlineToken(rest)
    if (!token) {
      nodes.push(rest)
      break
    }

    if (token.index > 0) nodes.push(rest.slice(0, token.index))

    const key = `${keyPrefix}-${tokenIndex}`
    const fullMatch = token.match[0]
    const value = token.match[1] ?? ''

    if (token.type === 'code') {
      nodes.push(<code key={key}>{value}</code>)
    } else if (token.type === 'strong') {
      nodes.push(<strong key={key}>{renderChild(value, key)}</strong>)
    } else if (token.type === 'link') {
      nodes.push(<a key={key} href={token.match[2]}>{renderChild(value, key)}</a>)
    } else if (onWikilinkClick) {
      const { display, target } = wikilinkParts(value)
      nodes.push(
        <span className="chat-wikilink" data-wikilink-target={target} key={key} role="link" tabIndex={0}>
          {display}
        </span>,
      )
    } else {
      nodes.push(fullMatch)
    }

    rest = rest.slice(token.index + fullMatch.length)
    tokenIndex += 1
  }

  return nodes
}

function isFence(line: string): boolean {
  return line.trimStart().startsWith('```')
}

function isHeading(line: string): boolean {
  return /^#{1,6}\s+/.test(line)
}

function isUnorderedListItem(line: string): boolean {
  return /^\s*[-*]\s+/.test(line)
}

function isOrderedListItem(line: string): boolean {
  return /^\s*\d+\.\s+/.test(line)
}

function isBlockquote(line: string): boolean {
  return /^\s*>\s?/.test(line)
}

function isSpecialBlockStart(line: string): boolean {
  return isFence(line) || isHeading(line) || isUnorderedListItem(line) || isOrderedListItem(line) || isBlockquote(line)
}

function renderMarkdownBlocks(content: string, onWikilinkClick: MarkdownContentProps['onWikilinkClick']): ReactNode[] {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (line.trim() === '') {
      index += 1
      continue
    }

    const blockKey = `block-${index}`

    if (isFence(line)) {
      const codeLines: string[] = []
      index += 1
      while (index < lines.length && !isFence(lines[index])) {
        codeLines.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push(<pre key={blockKey}><code>{codeLines.join('\n')}</code></pre>)
      continue
    }

    if (isHeading(line)) {
      const depth = Math.min(line.match(/^#+/u)?.[0].length ?? 1, 6)
      const body = line.replace(/^#{1,6}\s+/u, '')
      const HeadingTag = headingTags[depth - 1]
      blocks.push(<HeadingTag key={blockKey}>{renderInline(body, onWikilinkClick, blockKey)}</HeadingTag>)
      index += 1
      continue
    }

    if (isUnorderedListItem(line) || isOrderedListItem(line)) {
      const ordered = isOrderedListItem(line)
      const items: ReactNode[] = []
      while (
        index < lines.length
        && (ordered ? isOrderedListItem(lines[index]) : isUnorderedListItem(lines[index]))
      ) {
        const body = lines[index].replace(ordered ? /^\s*\d+\.\s+/u : /^\s*[-*]\s+/u, '')
        items.push(<li key={`${blockKey}-item-${items.length}`}>{renderInline(body, onWikilinkClick, `${blockKey}-item-${items.length}`)}</li>)
        index += 1
      }
      blocks.push(ordered ? <ol key={blockKey}>{items}</ol> : <ul key={blockKey}>{items}</ul>)
      continue
    }

    if (isBlockquote(line)) {
      const quoteLines: string[] = []
      while (index < lines.length && isBlockquote(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/u, ''))
        index += 1
      }
      blocks.push(
        <blockquote key={blockKey}>
          {renderInline(quoteLines.join('\n'), onWikilinkClick, blockKey)}
        </blockquote>,
      )
      continue
    }

    const paragraphLines = [line]
    index += 1
    while (index < lines.length && lines[index].trim() !== '' && !isSpecialBlockStart(lines[index])) {
      paragraphLines.push(lines[index])
      index += 1
    }
    blocks.push(<p key={blockKey}>{renderInline(paragraphLines.join('\n'), onWikilinkClick, blockKey)}</p>)
  }

  return blocks
}

export const MarkdownContent = memo(function MarkdownContent({ content, onWikilinkClick }: MarkdownContentProps) {
  const handleClick = useCallback((event: MouseEvent) => {
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-wikilink-target]')
    if (!element) return

    event.preventDefault()
    onWikilinkClick?.(element.dataset.wikilinkTarget!)
  }, [onWikilinkClick])

  return (
    <div className="ai-markdown" onClick={onWikilinkClick ? handleClick : undefined} role="presentation">
      {renderMarkdownBlocks(content, onWikilinkClick)}
    </div>
  )
})
