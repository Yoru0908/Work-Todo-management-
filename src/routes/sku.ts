import { Hono } from 'hono'
import { eq, desc, and } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { skuRecords } from '../schema'
import { requireAuth } from '../auth'
import { SkuPage } from '../templates/sku'
import { getTranslations, Locale } from '../i18n'
import { parseWithGemini, parseSkuPrompt } from '../ai/parser'

const app = new Hono<{ Bindings: { DB: D1Database }, Variables: { user: any } }>()

function getLocale(c: any): Locale {
  return (c.req.query('lang') as Locale) || 'ja'
}

// SKU page
app.get('/', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.redirect('/login')

  const locale = getLocale(c)
  const t = getTranslations(locale)

  const db = drizzle(c.env.DB)
  const records = await db.select().from(skuRecords).orderBy(desc(skuRecords.createdAt))

  return c.html(SkuPage({ t, user, records, locale, activePage: 'sku' }))
})

// Get all SKU records
app.get('/api/sku', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const db = drizzle(c.env.DB)
  const records = await db.select().from(skuRecords).orderBy(desc(skuRecords.createdAt))

  return c.json({ records })
})

// Create SKU manually
app.post('/api/sku', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  // Check for duplicates (orderNo + skuCode + color)
  const existing = await db.select().from(skuRecords).where(
    and(
      eq(skuRecords.orderNo, body.orderNo),
      eq(skuRecords.skuCode, body.skuCode),
      eq(skuRecords.color, body.color || '')
    )
  ).limit(1)

  if (existing.length > 0) {
    return c.json({ error: 'Duplicate: Same order number, SKU and color already exists', duplicate: true }, 400)
  }

  const [record] = await db.insert(skuRecords).values({
    orderNo: body.orderNo,
    skuCode: body.skuCode,
    product: body.product,
    brand: body.brand || '',
    color: body.color || '',
    quantity: body.quantity || 1,
    channel: body.channel || 'Online',
    status: body.status || 'pending',
    notes: body.notes || '',
    createdBy: user.id,
  }).returning()

  return c.json({ success: true, record })
})

// Update SKU
app.patch('/api/sku/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  const [updated] = await db.update(skuRecords).set({
    ...body,
    updatedAt: new Date().toISOString()
  }).where(eq(skuRecords.id, id)).returning()

  return c.json({ success: true, record: updated })
})

// Delete SKU
app.delete('/api/sku/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = parseInt(c.req.param('id'))
  const db = drizzle(c.env.DB)

  await db.delete(skuRecords).where(eq(skuRecords.id, id))
  return c.json({ success: true })
})

// AI Parse - Parse text and return JSON
app.post('/api/sku/ai-parse', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  const text = body.text as string

  if (!text) {
    return c.json({ error: 'No text provided' }, 400)
  }

  try {
    const results = await parseWithGemini(text, parseSkuPrompt(), c.env)
    return c.json({ results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
