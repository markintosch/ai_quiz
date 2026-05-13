// FILE: src/components/blog/CommentsList.tsx
// Server component — toont alleen approved comments. Email is privé en wordt
// nooit gerenderd, alleen author_name + created_at + body.

import { createServiceClient } from '@/lib/supabase/server'
import { STRINGS, formatDate, type Lang } from '@/lib/blog/strings'

interface Props {
  postId: string
  lang:   Lang
}

interface CommentRow {
  id:           string
  author_name:  string
  body:         string
  created_at:   string
}

export default async function CommentsList({ postId, lang }: Props) {
  const t = STRINGS[lang]
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_comments')
    .select('id, author_name, body, created_at')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
    .limit(200)

  const comments = (data ?? []) as CommentRow[]

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-brand">
        {t.commentsTitle}
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-600">
            · {t.commentsCount(comments.length)}
          </span>
        )}
      </h2>

      {comments.length === 0 ? (
        <p className="mb-6 text-sm text-gray-600">{t.commentsEmpty}</p>
      ) : (
        <ul className="mb-8 space-y-5">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs">
                <span className="font-semibold text-brand">{c.author_name}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-600">{formatDate(c.created_at, lang)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
