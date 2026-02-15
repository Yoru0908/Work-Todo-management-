import { Hono } from 'hono'
import { eq, desc, and } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { inventorySchedules } from '../schema'
import { requireAuth } from '../auth'
import { SchedulePage } from '../templates/schedule'
import { getTranslations, Locale } from '../i18n'
import { parseWithGemini, parseSchedulePrompt } from '../ai/parser'

const app = new Hono<{ Bindings: { DB: D1Database }, Variables: { user: any } }>()

function getLocale(c: any): Locale {
  return (c.req.query('lang') as Locale) || 'ja'
}

// Schedule page
app.get('/', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.redirect('/login')

  const locale = getLocale(c)
  const t = getTranslations(locale)

  const db = drizzle(c.env.DB)
  const schedules = await db.select().from(inventorySchedules).orderBy(desc(inventorySchedules.createdAt))

  return c.html(SchedulePage({ t, user, schedules, locale, activePage: 'schedule' }))
})

// Get all schedules
app.get('/api/schedule', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const db = drizzle(c.env.DB)
  const schedules = await db.select().from(inventorySchedules).orderBy(desc(inventorySchedules.createdAt))

  return c.json({ schedules })
})

// Create schedule manually
app.post('/api/schedule', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  // Check for duplicates
  const existing = await db.select().from(inventorySchedules).where(
    and(
      eq(inventorySchedules.orderNo, body.orderNo),
      eq(inventorySchedules.product, body.product)
    )
  ).limit(1)

  if (existing.length > 0) {
    return c.json({ error: 'Duplicate: Same order number and product already exists', duplicate: true }, 400)
  }

  const [schedule] = await db.insert(inventorySchedules).values({
    orderNo: body.orderNo,
    product: body.product,
    brand: body.brand || '',
    channel: body.channel || 'Online',
    shipmentDate: body.shipmentDate || null,
    eta: body.eta || null,
    arrivalDate: body.arrivalDate || null,
    notes: body.notes || '',
    createdBy: user.id,
  }).returning()

  return c.json({ success: true, schedule })
})

// Update schedule
app.patch('/api/schedule/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  const [updated] = await db.update(inventorySchedules).set({
    ...body,
    updatedAt: new Date().toISOString()
  }).where(eq(inventorySchedules.id, id)).returning()

  return c.json({ success: true, schedule: updated })
})

// Delete schedule
app.delete('/api/schedule/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const db = drizzle(c.env.DB)

  await db.delete(inventorySchedules).where(eq(inventorySchedules.id, id))
  return c.json({ success: true })
})

// AI Parse - Parse text and return JSON (not creating records)
app.post('/api/schedule/ai-parse', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  const text = body.text as string

  if (!text) {
    return c.json({ error: 'No text provided' }, 400)
  }

  try {
    const results = await parseWithGemini(text, parseSchedulePrompt(), c.env)
    return c.json({ results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
