import { Hono } from 'hono'
import { eq, and, desc } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { tasks, subtasks, infoNotes, taskHistory, requirementUpdates, users } from '../schema'
import { requireAuth, requireAdmin } from '../auth'
import { DashboardPage } from '../templates/dashboard'
import { TasksPage } from '../templates/tasks'
import { AdminPage } from '../templates/admin'
import { getTranslations, Locale } from '../i18n'
import { parseWithGemini, parseTaskPrompt } from '../ai/parser'

const app = new Hono<{ Bindings: { DB: D1Database }, Variables: { user: any } }>()

// Get current locale from cookie or query
function getLocale(c: any): Locale {
  return (c.req.query('lang') as Locale) || 'ja'
}

// Dashboard
app.get('/', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.redirect('/login')

  const locale = getLocale(c)
  const t = getTranslations(locale)

  const db = drizzle(c.env.DB)

  const allTasks = await db.select().from(tasks)
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const next3days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

  const total = allTasks.length
  const completed = allTasks.filter(t => t.status === '完了').length

  // 🔴 緊急: 優先度緊急 或 今天/明天截止
  const urgentTasks = allTasks
    .filter(t => t.status !== '完了' && (t.priority === '緊急' || t.deadline === today || t.deadline === tomorrow))
    .sort((a, b) => {
      // 紧急优先度排最前，然后按截止日期
      if (a.priority === '緊急' && b.priority !== '緊急') return -1
      if (a.priority !== '緊急' && b.priority === '緊急') return 1
      return (a.deadline || '').localeCompare(b.deadline || '')
    })
    .slice(0, 10)

  // 🟡 近日: 3天内截止（不含紧急）
  const upcomingTasks = allTasks
    .filter(t => t.status !== '完了' && t.deadline && t.deadline > tomorrow && t.deadline <= next3days)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .slice(0, 10)

  // 🟢 今後: 更远的未来
  const futureTasks = allTasks
    .filter(t => t.status !== '完了' && t.deadline && t.deadline > next3days)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .slice(0, 10)

  // ✅ 最近完了
  const recentCompleted = allTasks
    .filter(t => t.status === '完了')
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 5)

  // 🚨 ガイド/重点事項 (category = 'guide')
  const guides = allTasks
    .filter(t => t.category === 'guide')
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 10)

  return c.html(DashboardPage({
    t,
    user,
    stats: { total, urgent: urgentTasks.length, today: upcomingTasks.length, completed },
    urgentTasks,
    upcomingTasks,
    futureTasks,
    recentCompleted,
    guides,
    locale
  }))
})

// Tasks list
app.get('/tasks', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.redirect('/login')

  const locale = getLocale(c)
  const t = getTranslations(locale)

  const db = drizzle(c.env.DB)
  const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt))

  return c.html(TasksPage({ t, user, tasks: allTasks, locale }))
})

// Check for duplicate task (title + deadline + assignee)
app.post('/api/tasks/check-duplicate', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  const existing = await db.select().from(tasks).where(
    and(
      eq(tasks.title, body.title),
      eq(tasks.deadline, body.deadline || null),
      eq(tasks.assignee, body.assignee || '')
    )
  ).limit(1)

  return c.json({ duplicate: existing.length > 0, existing: existing[0] || null })
})

// Create task
app.post('/api/tasks', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  // Check for duplicates (title + deadline + assignee)
  const existing = await db.select().from(tasks).where(
    and(
      eq(tasks.title, body.title),
      eq(tasks.deadline, body.deadline || null),
      eq(tasks.assignee, body.assignee || '')
    )
  ).limit(1)

  if (existing.length > 0) {
    return c.json({ error: 'Duplicate: Same title, deadline and assignee already exists', duplicate: true, existing: existing[0] }, 400)
  }

  const [task] = await db.insert(tasks).values({
    title: body.title,
    deadline: body.deadline || null,
    requester: body.requester || '',
    destination: body.destination || '',
    type: body.type || 'その他',
    priority: body.priority || '中',
    status: body.status || '未着手',
    assignee: body.assignee || '',
    notes: body.notes || '',
    isImportant: body.isImportant ? 1 : 0,
    category: body.category || 'task', // 'task' or 'guide'
    content: body.content || null, // Detailed content for guides
    createdBy: user.id,
  }).returning()

  // Record history
  await db.insert(taskHistory).values({
    taskId: task.id,
    fieldName: 'created',
    newValue: body.title,
    changedBy: user.id,
  })

  return c.json({ success: true, task })
})

// Update task
app.patch('/api/tasks/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  const [existing] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const updates: any = { ...body, updatedAt: new Date().toISOString() }

  // Record history for each changed field
  for (const [key, value] of Object.entries(body)) {
    if (key !== 'id' && existing[key as keyof typeof existing] !== value) {
      await db.insert(taskHistory).values({
        taskId: id,
        fieldName: key,
        oldValue: String(existing[key as keyof typeof existing]),
        newValue: String(value),
        changedBy: user.id,
      })
    }
  }

  const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning()
  return c.json({ success: true, task: updated })
})

// Delete task
app.delete('/api/tasks/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const db = drizzle(c.env.DB)

  await db.delete(tasks).where(eq(tasks.id, id))
  return c.json({ success: true })
})

// Get task details with subtasks, notes, history
app.get('/api/tasks/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const db = drizzle(c.env.DB)

  const [task] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!task) return c.json({ error: 'Not found' }, 404)

  const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, id))
  const notes = await db.select().from(infoNotes).where(eq(infoNotes.taskId, id))
  const history = await db.select().from(taskHistory).where(eq(taskHistory.taskId, id)).orderBy(desc(taskHistory.changedAt))
  const requirements = await db.select().from(requirementUpdates).where(eq(requirementUpdates.taskId, id)).orderBy(desc(requirementUpdates.createdAt))

  return c.json({ task, subtasks: taskSubtasks, notes, history, requirements })
})

// Subtasks
app.post('/api/tasks/:taskId/subtasks', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const taskId = parseInt(c.req.param('taskId'))
  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  const [subtask] = await db.insert(subtasks).values({
    taskId,
    title: body.title,
    status: body.status || '未着手',
    sortOrder: body.sortOrder || 0,
  }).returning()

  return c.json({ success: true, subtask })
})

app.patch('/api/subtasks/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  const [updated] = await db.update(subtasks).set(body).where(eq(subtasks.id, id)).returning()
  return c.json({ success: true, subtask: updated })
})

app.delete('/api/subtasks/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const db = drizzle(c.env.DB)

  await db.delete(subtasks).where(eq(subtasks.id, id))
  return c.json({ success: true })
})

// Notes
app.post('/api/tasks/:taskId/notes', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const taskId = parseInt(c.req.param('taskId'))
  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  const [note] = await db.insert(infoNotes).values({
    taskId,
    content: body.content,
    isImportant: body.isImportant ? 1 : 0,
    createdBy: user.id,
  }).returning()

  return c.json({ success: true, note })
})

app.delete('/api/notes/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const db = drizzle(c.env.DB)

  await db.delete(infoNotes).where(eq(infoNotes.id, id))
  return c.json({ success: true })
})

// Requirement updates
app.post('/api/tasks/:taskId/requirements', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const taskId = parseInt(c.req.param('taskId'))
  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  const [req] = await db.insert(requirementUpdates).values({
    taskId,
    content: body.content,
    createdBy: user.id,
  }).returning()

  return c.json({ success: true, requirement: req })
})

// Admin page
app.get('/admin', async (c) => {
  const user = requireAdmin(c)
  if (!user) return c.text('Forbidden', 403)

  const locale = getLocale(c)
  const t = getTranslations(locale)

  const db = drizzle(c.env.DB)
  const allUsers = await db.select().from(users)

  return c.html(AdminPage({ t, user, users: allUsers, locale }))
})

// Add user (admin only)
app.post('/api/users', async (c) => {
  const user = requireAdmin(c)
  if (!user) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  const passwordHash = await bcrypt.hash(body.password, 10)

  const [newUser] = await db.insert(users).values({
    username: body.username,
    displayName: body.displayName,
    passwordHash,
    role: body.role || 'member',
  }).returning()

  return c.json({ success: true, user: { ...newUser, passwordHash: undefined } })
})

// Delete user (admin only)
app.delete('/api/users/:id', async (c) => {
  const user = requireAdmin(c)
  if (!user) return c.json({ error: 'Forbidden' }, 403)

  const id = parseInt(c.req.param('id'))
  if (id === user.id) return c.json({ error: 'Cannot delete yourself' }, 400)

  const db = drizzle(c.env.DB)
  await db.delete(users).where(eq(users.id, id))

  return c.json({ success: true })
})

// AI Parse - Parse text and return JSON (not creating records)
app.post('/api/tasks/ai-parse', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  const text = body.text as string

  if (!text) {
    return c.json({ error: 'No text provided' }, 400)
  }

  try {
    const results = await parseWithGemini(text, parseTaskPrompt(), c.env)
    return c.json({ results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
