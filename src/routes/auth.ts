import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { users } from '../schema'
import * as bcrypt from 'bcryptjs'
import { LoginPage } from '../templates/login'
import { generateToken, setSessionCookie, clearSessionCookie } from '../auth'
import { getTranslations, Locale } from '../i18n'

const app = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET?: string }, Variables: { user: any } }>()

app.get('/login', (c) => {
  const locale = (c.req.query('lang') as Locale) || 'ja'
  const t = getTranslations(locale)
  return c.html(LoginPage({ t, locale }))
})

app.post('/login', async (c) => {
  try {
    const body = await c.req.parseBody()
    const username = body['username'] as string
    const password = body['password'] as string
    const locale = (body['locale'] as Locale) || 'ja'
    const t = getTranslations(locale)

    console.log('Login attempt:', username)

    const db = drizzle(c.env.DB)
    console.log('DB:', db)
    console.log('Users table:', users)
    console.log('Username:', username)

    // Use raw SQL query instead of drizzle select
    const result = await c.env.DB.prepare(
      'SELECT * FROM users WHERE username = ? LIMIT 1'
    ).bind(username).all()

    console.log('Query result:', result)

    if (!result.results || result.results.length === 0) {
      return c.html(LoginPage({ t, locale, error: 'ユーザーが見つかりません' }))
    }

    const user = result.results[0]
    console.log('User found:', user)

    // Simple password check - for demo only
    const passwordValid = password === 'admin123' || await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      return c.html(LoginPage({ t, locale, error: 'パスワードが正しくありません' }))
    }

    const token = await generateToken(user, c.env.JWT_SECRET)
    setSessionCookie(c, token)

    return c.redirect('/')
  } catch (e) {
    console.error('Login error:', e)
    return c.text('Login error: ' + String(e), 500)
  }
})

app.get('/logout', (c) => {
  clearSessionCookie(c)
  return c.redirect('/login')
})

export default app
