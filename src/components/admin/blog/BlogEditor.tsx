// FILE: src/components/admin/blog/BlogEditor.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Tiptap-based rich text editor for /admin/blog/[id].
//
// Toolbar (essentials only — keep cognitive load low for non-coder authors):
//   • H2, H3
//   • bold, italic, underline, strike, code
//   • bullet list, ordered list, blockquote
//   • link (insert/edit/remove)
//   • image upload (calls /api/admin/blog/upload — preserves alt prompt)
//   • YouTube/Vimeo embed (URL prompt — sanitised by renderer)
//   • horizontal rule
//   • undo / redo
//
// On every change we hand the latest JSON back via onChange. The parent page
// owns the save/publish lifecycle.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import LinkExt from '@tiptap/extension-link'
import ImageExt from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Node, mergeAttributes } from '@tiptap/core'
import { useEffect, useRef, useState } from 'react'
import type { TiptapDoc } from '@/types/blog'

// ── Custom node: youtube/vimeo embed ────────────────────────────────────────
// We add a minimal `iframe` node with one attr `src`. The server-side renderer
// (renderTiptap.tsx) whitelists hosts on output, so users can't inject raw HTML.
const VideoEmbed = Node.create({
  name: 'youtube',
  group: 'block',
  atom:  true,
  addAttributes() {
    return { src: { default: '' } }
  },
  parseHTML() {
    return [{ tag: 'iframe[src]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'tt-video-embed' },
      [
        'iframe',
        mergeAttributes(HTMLAttributes, {
          allowfullscreen: 'true',
          frameborder:     '0',
          class:           'w-full aspect-video rounded-md border border-gray-200',
        }),
      ],
    ]
  },
})

interface Props {
  initialDoc: TiptapDoc
  onChange:   (doc: TiptapDoc) => void
}

export default function BlogEditor({ initialDoc, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto', 'tel'],
        HTMLAttributes: { rel: 'noopener noreferrer', class: 'text-brand-accent underline' },
      }),
      ImageExt.configure({
        HTMLAttributes: { class: 'rounded-md border border-gray-200' },
      }),
      VideoEmbed,
      Placeholder.configure({
        placeholder: 'Begin met schrijven…',
      }),
    ],
    content: initialDoc,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapDoc)
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-blog max-w-none min-h-[400px] rounded-md border border-gray-200 bg-white p-6 focus:outline-none focus:ring-2 focus:ring-brand-accent/30',
      },
    },
  })

  // If parent swaps the post (e.g. after translate), reset the editor content.
  useEffect(() => {
    if (editor && initialDoc) {
      const current = editor.getJSON()
      if (JSON.stringify(current) !== JSON.stringify(initialDoc)) {
        // Tiptap v2/v3 setContent — { emitUpdate: false } prevents an
        // immediate onChange storm when we programmatically swap content.
        editor.commands.setContent(initialDoc, { emitUpdate: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDoc])

  // Cleanup on unmount.
  useEffect(() => () => { editor?.destroy() }, [editor])

  if (!editor) return null

  // ── Image upload handler ──────────────────────────────────────────────
  async function handleImageFile(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/admin/blog/upload', { method: 'POST', body: fd })
      const j = await r.json()
      if (!r.ok || !j.url) {
        alert(`Upload mislukt: ${j.error ?? 'onbekende fout'}`)
        return
      }
      const alt = window.prompt('Alt-tekst (kort beschrijven wat de afbeelding toont, voor SEO + toegankelijkheid):') ?? ''
      editor!.chain().focus().setImage({ src: j.url, alt }).run()
    } finally {
      setUploading(false)
    }
  }

  function onImageButtonClick() { fileInputRef.current?.click() }
  function onImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) void handleImageFile(f)
    e.target.value = ''                               // allow re-picking the same file
  }

  // ── Link handler ──────────────────────────────────────────────────────
  function setLink() {
    const previous = editor!.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL (laat leeg om link te verwijderen):', previous ?? '')
    if (url === null) return                          // cancelled
    if (url === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  // ── Video embed handler ──────────────────────────────────────────────
  function insertVideo() {
    const url = window.prompt('YouTube of Vimeo URL:')
    if (!url) return
    const embed = toEmbedUrl(url)
    if (!embed) {
      alert('Niet herkend als YouTube of Vimeo URL.')
      return
    }
    editor!.chain().focus().insertContent({ type: 'youtube', attrs: { src: embed } }).run()
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap gap-1 rounded-md border border-gray-200 bg-gray-50 p-2 text-sm">
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</ToolBtn>
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive('bold')}      title="Vetgedrukt"><b>B</b></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive('italic')}    title="Italic"><i>I</i></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Onderstreept"><u>U</u></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive('strike')}    title="Doorgestreept"><s>S</s></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()}      active={editor.isActive('code')}      title="Inline code">{'</>'}</ToolBtn>
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}  title="Bullet list">• Lijst</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Genummerde lijst">1. Lijst</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}  active={editor.isActive('blockquote')}  title="Quote">❝ Quote</ToolBtn>
        <Sep />
        <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Link">🔗 Link</ToolBtn>
        <ToolBtn onClick={onImageButtonClick} title="Afbeelding uploaden">{uploading ? 'Bezig…' : '🖼 Afbeelding'}</ToolBtn>
        <ToolBtn onClick={insertVideo} title="YouTube/Vimeo embed">🎬 Video</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Scheidingslijn">— Lijn</ToolBtn>
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Ongedaan maken">↶</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Opnieuw">↷</ToolBtn>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageFileChange}
      />

      <EditorContent editor={editor} />
    </div>
  )
}

// ── Subcomponents ──────────────────────────────────────────────────────────
function ToolBtn({
  onClick, active, children, title,
}: {
  onClick:  () => void
  active?:  boolean
  children: React.ReactNode
  title?:   string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={
        'rounded px-2 py-1 text-sm transition-colors ' +
        (active
          ? 'bg-brand text-white'
          : 'text-gray-700 hover:bg-white hover:text-brand')
      }
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="mx-1 self-stretch border-l border-gray-300" aria-hidden />
}

// ── helpers ─────────────────────────────────────────────────────────────────
function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw)
    // YouTube watch URL
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube-nocookie.com/embed/${u.pathname.replace(/^\//, '')}`
    }
    if (u.hostname.endsWith('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`
      const m = u.pathname.match(/^\/embed\/([^/]+)/)
      if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`
    }
    // Vimeo
    if (u.hostname === 'vimeo.com') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`
    }
    if (u.hostname === 'player.vimeo.com') return u.toString()
    return null
  } catch {
    return null
  }
}
