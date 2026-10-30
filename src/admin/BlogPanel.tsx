import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import {
  AdminApiError,
  blog,
  getToken,
  login,
  logout,
  me,
  type BlogPost,
  type BlogPostInput,
  type BlogPostListItem,
  type PlatformAccess,
} from './adminApi'
import { Button, Card, Field, Modal } from '@/ui/primitives'

/**
 * Блог: вход и CRUD-список постов.
 *
 * Права читаются из `platform.permissions`, которые отдаёт CRM при входе —
 * тот же каталог ключей (`blog.view`/`blog.edit`/`blog.publish`/`blog.delete`),
 * что и в самой Gravity RPA, просто проверяется здесь, на клиенте, чтобы не
 * показывать то, что всё равно отклонит сервер.
 */

type Status = 'checking' | 'anon' | 'forbidden' | 'in'

function hasPermission(platform: PlatformAccess | null, key: string): boolean {
  return Boolean(platform?.permissions.includes(key))
}

export function BlogPanel() {
  const [status, setStatus] = useState<Status>('checking')
  const [platform, setPlatform] = useState<PlatformAccess | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (!getToken()) {
      setStatus('anon')
      return
    }
    me()
      .then((r) => {
        setUserName(r.user.name)
        setPlatform(r.platform)
        setStatus(hasPermission(r.platform, 'blog.view') ? 'in' : 'forbidden')
      })
      .catch(() => setStatus('anon'))
  }, [])

  const onLoggedIn = (name: string, p: PlatformAccess | null) => {
    setUserName(name)
    setPlatform(p)
    setStatus(hasPermission(p, 'blog.view') ? 'in' : 'forbidden')
  }

  const onLogout = () => {
    void logout()
    setPlatform(null)
    setStatus('anon')
  }

  if (status === 'checking') {
    return (
      <Card className="p-6 text-sm text-fg-muted">
        Проверяем вход…
      </Card>
    )
  }

  if (status === 'anon') {
    return (
      <Card className="p-6">
        <h2 className="text-lg">Блог</h2>
        <p className="mt-2 text-sm text-fg-muted">Войдите учётной записью Gravity RPA с доступом к блогу.</p>
        <LoginForm className="mt-5" onLoggedIn={onLoggedIn} />
      </Card>
    )
  }

  if (status === 'forbidden') {
    return (
      <Card className="p-6">
        <h2 className="text-lg">Блог</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Вход выполнен{userName ? ` (${userName})` : ''}, но у этой учётной записи нет прав на блог. Попросите
          выдать право «Просмотр постов» в разделе «Роли и права» Gravity RPA.
        </p>
        <Button className="mt-5" variant="outline" onClick={onLogout}>
          Выйти
        </Button>
      </Card>
    )
  }

  return <BlogWorkspace userName={userName} platform={platform} onLogout={onLogout} />
}

function LoginForm({ className, onLoggedIn }: { className?: string; onLoggedIn: (name: string, platform: PlatformAccess | null) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [needsTotp, setNeedsTotp] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setError('')
    try {
      const r = await login(email.trim(), password, totpCode.trim() || undefined)
      onLoggedIn(r.user.name, r.platform)
    } catch (e) {
      if (e instanceof AdminApiError && e.totpRequired) {
        setNeedsTotp(true)
        setError(totpCode ? e.message : 'Введите код из приложения-аутентификатора')
      } else {
        setError(e instanceof AdminApiError ? e.message : 'Не удалось войти')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className={className}>
      <div className="space-y-3">
        <Field label="Email" name="email" type="email" value={email} onChange={setEmail} required autoComplete="username" />
        <Field
          label="Пароль"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
        />
        {needsTotp && (
          <Field label="Код из приложения" name="totp" value={totpCode} onChange={setTotpCode} inputMode="text" />
        )}
      </div>
      {error && <p className="mt-3 text-xs text-fg-muted">{error}</p>}
      <Button type="submit" className="mt-4 w-full" disabled={sending || !email.trim() || !password}>
        {sending ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Рабочая область: список постов + редактор                           */
/* ------------------------------------------------------------------ */

function BlogWorkspace({
  userName,
  platform,
  onLogout,
}: {
  userName: string
  platform: PlatformAccess | null
  onLogout: () => void
}) {
  const canEdit = hasPermission(platform, 'blog.edit')
  const canPublish = hasPermission(platform, 'blog.publish')
  const canDelete = hasPermission(platform, 'blog.delete')

  const [posts, setPosts] = useState<BlogPostListItem[] | null>(null)
  const [error, setError] = useState('')
  const [editorId, setEditorId] = useState<string | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BlogPostListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setError('')
    blog
      .list()
      .then(setPosts)
      .catch((e) => setError(e instanceof AdminApiError ? e.message : 'Не удалось загрузить список'))
  }

  useEffect(load, [])

  const remove = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await blog.remove(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : 'Не удалось удалить')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg">Блог</h2>
          <p className="mt-1 text-xs text-fg-muted">Вы вошли как {userName}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button size="sm" onClick={() => setEditorId('new')}>
              Новая статья
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onLogout}>
            Выйти
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-line bg-accent-soft px-4 py-3 text-xs text-fg-muted">
          {error}{' '}
          <button type="button" onClick={load} className="underline underline-offset-2">
            Повторить
          </button>
        </p>
      )}

      {!posts && !error && <p className="mt-6 text-sm text-fg-muted">Загружаем…</p>}

      {posts && posts.length === 0 && <p className="mt-6 text-sm text-fg-muted">Статей пока нет.</p>}

      {posts && posts.length > 0 && (
        <ul className="mt-6 divide-y divide-line">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="truncate font-medium">{post.title}</p>
                <p className="mt-0.5 text-xs text-fg-subtle">
                  {post.status === 'PUBLISHED' ? 'Опубликован' : 'Черновик'}
                  {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString('ru-RU')}` : ''} · /blog/
                  {post.slug}/
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {canEdit && (
                  <Button size="sm" variant="outline" onClick={() => setEditorId(post.id)}>
                    Открыть
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(post)}>
                    Удалить
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editorId && (
        <PostEditor
          postId={editorId}
          canPublish={canPublish}
          onClose={() => setEditorId(null)}
          onSaved={() => {
            setEditorId(null)
            load()
          }}
        />
      )}

      <Modal open={deleteTarget !== null} onClose={() => !deleting && setDeleteTarget(null)} title="Удалить статью?">
        <p className="text-sm text-fg-muted">
          Статья «{deleteTarget?.title}» будет удалена безвозвратно
          {deleteTarget?.status === 'PUBLISHED' ? ' и пропадёт с сайта после следующего деплоя.' : '.'}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" disabled={deleting} onClick={() => setDeleteTarget(null)}>
            Отмена
          </Button>
          <Button disabled={deleting} onClick={() => void remove()}>
            {deleting ? 'Удаление…' : 'Удалить'}
          </Button>
        </div>
      </Modal>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Редактор одной статьи                                               */
/* ------------------------------------------------------------------ */

const RU_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .split('')
    .map((ch) => RU_TO_LATIN[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140)
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function PostEditor({
  postId,
  canPublish,
  onClose,
  onSaved,
}: {
  postId: string | 'new'
  canPublish: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = postId === 'new'
  const [loaded, setLoaded] = useState<BlogPost | null>(null)
  const [loadError, setLoadError] = useState('')

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [publishedAt, setPublishedAt] = useState('')
  const [preview, setPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew) return
    blog
      .get(postId)
      .then((post) => {
        setLoaded(post)
        setTitle(post.title)
        setSlug(post.slug)
        setSlugTouched(true)
        setDescription(post.description)
        setTagsInput(post.tags.join(', '))
        setCoverImageUrl(post.coverImageUrl ?? '')
        setBody(post.body)
        setStatus(post.status)
        setPublishedAt(toDatetimeLocal(post.publishedAt))
      })
      .catch((e) => setLoadError(e instanceof AdminApiError ? e.message : 'Не удалось загрузить статью'))
  }, [isNew, postId])

  const changeTitle = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const uploadCover = async (file: File) => {
    setUploading(true)
    try {
      const res = await blog.uploadCover(file)
      setCoverImageUrl(res.url)
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : 'Не удалось загрузить изображение')
    } finally {
      setUploading(false)
    }
  }

  const save = async (nextStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim()) return setError('Укажите заголовок')
    if (!slug.trim()) return setError('Укажите адрес статьи')
    if (!description.trim()) return setError('Укажите краткое описание')
    if (!body.trim()) return setError('Текст статьи не может быть пустым')

    const effectivePublishedAt =
      nextStatus === 'PUBLISHED' ? publishedAt || toDatetimeLocal(new Date().toISOString()) : publishedAt

    setSaving(true)
    setError('')
    try {
      const input: BlogPostInput = {
        slug: slug.trim(),
        title: title.trim(),
        description: description.trim(),
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        body,
        coverImageUrl: coverImageUrl.trim() || null,
        status: nextStatus,
        publishedAt: effectivePublishedAt ? new Date(effectivePublishedAt).toISOString() : null,
      }
      if (isNew) await blog.create(input)
      else await blog.update(postId, input)
      onSaved()
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  const previewHtml = useMemo(() => (preview ? (marked.parse(body, { async: false }) as string) : ''), [preview, body])
  const touchesLive = status === 'PUBLISHED'
  const locked = touchesLive && !canPublish

  return (
    <Modal open onClose={() => !saving && onClose()} title={isNew ? 'Новая статья' : 'Редактирование статьи'}>
      {loadError && <p className="text-sm text-fg-muted">{loadError}</p>}
      {!isNew && !loaded && !loadError && <p className="text-sm text-fg-muted">Загружаем…</p>}

      {(isNew || loaded) && (
        <div className="max-h-[70svh] space-y-4 overflow-y-auto pr-1">
          {locked && (
            <p className="rounded-xl border border-line bg-accent-soft px-4 py-3 text-xs text-fg-muted">
              Статья уже опубликована — без права «Публикация постов» её можно только посмотреть.
            </p>
          )}

          <Field label="Заголовок" name="title" value={title} onChange={changeTitle} required />
          <div>
            <Field
              label="Адрес статьи"
              name="slug"
              value={slug}
              onChange={(v) => {
                setSlugTouched(true)
                setSlug(v)
              }}
              required
            />
            <p className="mt-1.5 text-xs text-fg-subtle">g-neuro.space/blog/{slug || '…'}/</p>
          </div>
          <Field label="Краткое описание" name="description" value={description} onChange={setDescription} multiline rows={2} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Теги (через запятую)" name="tags" value={tagsInput} onChange={setTagsInput} />
            <Field
              label="Дата публикации"
              name="publishedAt"
              type="datetime-local"
              value={publishedAt}
              onChange={setPublishedAt}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-fg-muted">Обложка</label>
            <div className="flex items-center gap-2">
              {coverImageUrl && <img src={coverImageUrl} alt="" className="size-10 rounded-lg border border-line object-cover" />}
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="URL изображения"
                className="h-11 flex-1 rounded-xl border border-line bg-bg px-3.5 text-sm outline-none focus:border-accent"
              />
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void uploadCover(file)
                  e.target.value = ''
                }}
              />
              <Button type="button" variant="outline" disabled={uploading} onClick={() => coverInputRef.current?.click()}>
                {uploading ? '…' : 'Загрузить'}
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm text-fg-muted">Текст статьи (markdown)</label>
              <button type="button" onClick={() => setPreview((p) => !p)} className="text-xs underline underline-offset-2">
                {preview ? 'Редактировать' : 'Предпросмотр'}
              </button>
            </div>
            {preview ? (
              <div
                className="blog-md-preview max-h-80 overflow-y-auto rounded-xl border border-line p-4 text-sm"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
                className="w-full rounded-xl border border-line bg-bg p-3.5 font-mono text-xs outline-none focus:border-accent"
              />
            )}
          </div>

          {error && <p className="text-xs text-fg-muted">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
            <Button variant="outline" disabled={saving} onClick={onClose}>
              Отмена
            </Button>
            <Button variant="outline" disabled={saving || locked} onClick={() => void save('DRAFT')}>
              {saving ? 'Сохранение…' : 'Сохранить черновик'}
            </Button>
            <Button disabled={saving || !canPublish} onClick={() => void save('PUBLISHED')}>
              {saving ? 'Публикация…' : status === 'PUBLISHED' ? 'Сохранить' : 'Опубликовать'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
