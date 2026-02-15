import { Translations, Locale } from '../i18n'

interface LoginProps {
  t: Translations
  locale: Locale
  error?: string
}

export function LoginPage({ t, locale, error }: LoginProps) {
  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.login} - ${t.appName}</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="login-body">
  <div class="login-card">
    <div class="login-header">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
      </div>
      <h1>${t.loginTitle}</h1>
      <p>${t.loginSubtitle}</p>
    </div>

    <form method="POST" action="/login">
      <input type="hidden" name="locale" value="${locale}">

      ${error ? `<div class="alert-banner" style="margin-bottom: 16px;">
        <span style="color: var(--red);">${error}</span>
      </div>` : ''}

      <div class="form-group">
        <label for="username">${t.username}</label>
        <input type="text" id="username" name="username" required autocomplete="username">
      </div>

      <div class="form-group">
        <label for="password">${t.password}</label>
        <input type="password" id="password" name="password" required autocomplete="current-password">
      </div>

      <button type="submit" class="btn btn-primary btn-full" style="margin-top: 8px;">
        ${t.login}
      </button>
    </form>

    <div class="lang-toggle" style="margin-top: 24px;">
      <button class="lang-btn ${locale === 'ja' ? 'active' : ''}" onclick="switchLang('ja')">日本語</button>
      <button class="lang-btn ${locale === 'zh' ? 'active' : ''}" onclick="switchLang('zh')">中文</button>
    </div>
  </div>

  <script>
    function switchLang(lang) {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.location.href = url.toString();
      }
    }
  </script>
</body>
</html>
  `
}
