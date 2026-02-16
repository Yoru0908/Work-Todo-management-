import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { tasks } from '../schema'
import { requireAuth } from '../auth'
import { GuidesPage } from '../templates/guides'
import { getTranslations, Locale } from '../i18n'

const app = new Hono<{ Bindings: { DB: D1Database }, Variables: { user: any } }>()

function getLocale(c: any): Locale {
  return (c.req.query('lang') as Locale) || 'ja'
}

// Guides list page
app.get('/', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.redirect('/login')

  const locale = getLocale(c)
  const t = getTranslations(locale)

  const db = drizzle(c.env.DB)

  // Get all guides
  const guides = await db.select().from(tasks)
    .where(eq(tasks.category, 'guide'))
    .orderBy(desc(tasks.updatedAt))

  // Get all tasks (for linking)
  const allTasks = await db.select().from(tasks)
    .where(eq(tasks.category, 'task'))
    .orderBy(desc(tasks.createdAt))

  return c.html(GuidesPage({
    t,
    user,
    guides,
    allTasks,
    locale
  }))
})

export default app
