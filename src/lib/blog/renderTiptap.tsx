/**
 * Server-side Tiptap → React renderer.
 *
 * The admin editor saves a Tiptap (ProseMirror) JSON document to Supabase. On
 * the public detail page we walk that tree on the server and emit the matching
 * React elements. This avoids shipping the editor bundle to readers.
 *
 * Supported nodes: doc, paragraph, heading (h1–h4), bulletList, orderedList,
 * listItem, blockquote, codeBlock, horizontalRule, hardBreak, image, youtube,
 * link (mark), bold (mark), italic (mark), code (mark), underline (mark),
 * strike (mark).
 */

import type { ReactNode } from 'react'
import type { TiptapDoc, TiptapNode, TiptapMark } from '@/types/blog'

// Whitelist of YouTube/Vimeo embed hosts — never embed arbitrary iframes.
const VIDEO_EMBED_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
])

export function RenderTiptap({ doc }: { doc: TiptapDoc | null | undefined }) {
  if (!doc || !Array.isArray(doc.content) || doc.content.length === 0) {
    return null
  }
  return <>{doc.content.map((n, i) => renderNode(n, `0-${i}`))}</>
}

function renderNode(node: TiptapNode, key: string): ReactNode {
  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className="mb-5 leading-relaxed text-gray-800">
          {renderChildren(node, key)}
        </p>
      )

    case 'heading': {
      const level = clampLevel(node.attrs?.level)
      const Tag = (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4')
      const cls = headingClasses(level)
      return (
        <Tag key={key} className={cls}>
          {renderChildren(node, key)}
        </Tag>
      )
    }

    case 'bulletList':
      return (
        <ul key={key} className="mb-6 ml-5 list-disc space-y-2 text-gray-800">
          {renderChildren(node, key)}
        </ul>
      )

    case 'orderedList':
      return (
        <ol key={key} className="mb-6 ml-5 list-decimal space-y-2 text-gray-800">
          {renderChildren(node, key)}
        </ol>
      )

    case 'listItem':
      return (
        <li key={key} className="leading-relaxed">
          {renderChildren(node, key)}
        </li>
      )

    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="my-6 border-l-4 border-brand-accent bg-gray-50 px-5 py-3 italic text-gray-700"
        >
          {renderChildren(node, key)}
        </blockquote>
      )

    case 'codeBlock':
      return (
        <pre
          key={key}
          className="my-6 overflow-x-auto rounded-md bg-gray-900 px-4 py-3 text-sm text-gray-100"
        >
          <code>{renderChildren(node, key)}</code>
        </pre>
      )

    case 'horizontalRule':
      return <hr key={key} className="my-8 border-gray-200" />

    case 'hardBreak':
      return <br key={key} />

    case 'image': {
      const src = stringAttr(node.attrs?.src)
      if (!src || !isSafeImage(src)) return null
      const alt = stringAttr(node.attrs?.alt) ?? ''
      const title = stringAttr(node.attrs?.title)
      return (
        <figure key={key} className="my-6">
          {/* Plain <img> instead of next/image because URLs are user-generated.
              Supabase Storage host can be added to next.config.mjs domains list
              if Mark wants next/image optimisation later. */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full rounded-md border border-gray-200"
          />
          {title && (
            <figcaption className="mt-2 text-center text-sm text-gray-600">{title}</figcaption>
          )}
        </figure>
      )
    }

    case 'youtube':
    case 'iframe': {
      const src = stringAttr(node.attrs?.src)
      if (!src) return null
      try {
        const u = new URL(src)
        if (!VIDEO_EMBED_HOSTS.has(u.hostname)) return null
        return (
          <div key={key} className="my-6 aspect-video overflow-hidden rounded-md border border-gray-200">
            <iframe
              src={u.toString()}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
              title="Video embed"
            />
          </div>
        )
      } catch {
        return null
      }
    }

    case 'text':
      return renderText(node, key)

    case 'doc':
      return <>{renderChildren(node, key)}</>

    default:
      // Unknown node type — render children (graceful degradation).
      return <>{renderChildren(node, key)}</>
  }
}

function renderChildren(node: TiptapNode, parentKey: string): ReactNode {
  if (!Array.isArray(node.content)) return null
  return node.content.map((child, i) => renderNode(child, `${parentKey}-${i}`))
}

/**
 * Render a text leaf with all marks applied. Marks wrap from outside-in.
 */
function renderText(node: TiptapNode, key: string): ReactNode {
  if (typeof node.text !== 'string') return null
  let element: ReactNode = node.text
  const marks = node.marks ?? []
  for (const mark of marks) {
    element = applyMark(mark, element, key)
  }
  return <span key={key}>{element}</span>
}

function applyMark(mark: TiptapMark, child: ReactNode, key: string): ReactNode {
  switch (mark.type) {
    case 'bold':
    case 'strong':
      return <strong key={`${key}-b`} className="font-semibold text-gray-900">{child}</strong>
    case 'italic':
    case 'em':
      return <em key={`${key}-i`}>{child}</em>
    case 'underline':
      return <u key={`${key}-u`}>{child}</u>
    case 'strike':
      return <s key={`${key}-s`}>{child}</s>
    case 'code':
      return (
        <code key={`${key}-c`} className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em] text-brand">
          {child}
        </code>
      )
    case 'link': {
      const href = stringAttr(mark.attrs?.href)
      if (!href || !isSafeLink(href)) return child
      const isExternal = isExternalLink(href)
      return (
        <a
          key={`${key}-a`}
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}
          className="font-medium text-brand-accent underline decoration-brand-accent/30 underline-offset-2 hover:decoration-brand-accent"
        >
          {child}
        </a>
      )
    }
    default:
      return child
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function clampLevel(raw: unknown): 1 | 2 | 3 | 4 {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (n === 1) return 1
  if (n === 2) return 2
  if (n === 3) return 3
  return 4
}

function headingClasses(level: 1 | 2 | 3 | 4): string {
  switch (level) {
    case 1: return 'mb-4 mt-8 text-3xl font-bold text-brand'
    case 2: return 'mb-3 mt-8 text-2xl font-bold text-brand'
    case 3: return 'mb-3 mt-6 text-xl font-semibold text-brand'
    case 4: return 'mb-2 mt-5 text-lg font-semibold text-brand'
  }
}

function stringAttr(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

/** Block javascript: / data: / file: URLs. Allow http(s), mailto, tel, and root-relative. */
function isSafeLink(href: string): boolean {
  const trimmed = href.trim().toLowerCase()
  if (trimmed.startsWith('javascript:')) return false
  if (trimmed.startsWith('data:'))       return false
  if (trimmed.startsWith('file:'))       return false
  if (trimmed.startsWith('vbscript:'))   return false
  return true
}

function isExternalLink(href: string): boolean {
  if (href.startsWith('/')   ) return false
  if (href.startsWith('#')   ) return false
  if (href.startsWith('mailto:')) return false
  if (href.startsWith('tel:'))    return false
  return /^https?:/i.test(href)
}

/** Same blocklist for image src — additionally must be http(s) or root-relative. */
function isSafeImage(src: string): boolean {
  const trimmed = src.trim().toLowerCase()
  if (trimmed.startsWith('javascript:')) return false
  if (trimmed.startsWith('vbscript:'))   return false
  if (trimmed.startsWith('file:'))       return false
  if (trimmed.startsWith('/'))           return true
  return /^https?:/i.test(trimmed)
}

/**
 * Strip Tiptap doc to plain text — used for meta descriptions when excerpt is empty,
 * and for word counting / reading-time.
 */
export function tiptapToPlainText(doc: TiptapDoc | null | undefined, max = 320): string {
  if (!doc || !Array.isArray(doc.content)) return ''
  const parts: string[] = []
  walk(doc as unknown as TiptapNode, parts)
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim()
  return joined.length > max ? joined.slice(0, max - 1).trimEnd() + '…' : joined
}

function walk(node: TiptapNode, out: string[]): void {
  if (typeof node.text === 'string') out.push(node.text)
  if (Array.isArray(node.content)) {
    for (const c of node.content) walk(c, out)
  }
}
