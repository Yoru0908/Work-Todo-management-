// AI Parser using Gemini API

interface Env {
  GEMINI_API_KEY?: string
  AI_PROVIDER?: string
  GEMINI_PROXY_URL?: string
  GEMINI_PROXY_KEY?: string
}

export async function parseWithGemini(text: string, prompt: string, env: Env): Promise<any> {
  const apiKey = env.GEMINI_API_KEY || ''
  const provider = env.AI_PROVIDER || 'gemini'

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const model = 'gemini-2.0-flash'

  // Build request based on provider
  let url: string
  let headers: Record<string, string>
  let body: any

  if (provider === 'gemini' && !env.GEMINI_PROXY_URL) {
    // Direct Google AI Studio API
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    headers = { 'Content-Type': 'application/json' }
    body = {
      contents: [{ parts: [{ text: prompt + '\n\n' + text }] }],
      generationConfig: {
        temperature: 0.5
      }
    }
  } else {
    // Use Cloudflare Worker proxy - expects Google Gemini format
    const proxyUrl = env.GEMINI_PROXY_URL || 'https://gemini-proxy.srzwyuu.workers.dev'
    // Add API key and model to URL
    url = `${proxyUrl}?key=${apiKey}&model=${model}`
    headers = {
      'Content-Type': 'application/json'
    }
    body = {
      contents: [{ parts: [{ text: prompt + '\n\n' + text }] }],
      generationConfig: {
        temperature: 0.5
      }
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API error: ${response.status} - ${errorText}`)
  }

  const data: any = await response.json()

  // Parse response - both direct and proxy return Gemini format
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Try to extract JSON from response
  try {
    // Find JSON in response
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) ||
                      resultText.match(/```\n([\s\S]*?)\n```/) ||
                      resultText.match(/\[[\s\S]*\]/) ||
                      resultText.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0])
    }
    return JSON.parse(resultText)
  } catch {
    return resultText
  }
}

// Parse inventory schedule text
export function parseSchedulePrompt(): string {
  return `Parse the following text and extract inventory schedule information. For each line, extract into JSON with these fields:
- orderNo (注文番号)
- product (商品名)
- brand (ブランド: Judydoll, Flower Knows, or Other)
- quantity (数量)
- channel (チャネル: Online, Offline, Sample, or Fixture)
- shipDate (発送日) - format as YYYY-MM-DD
- eta (ETA) - format as YYYY-MM-DD
- warehouseDate (入倉日) - format as YYYY-MM-DD

Return a JSON array. If a field is not found, use empty string.`
}

// Parse SKU text
export function parseSkuPrompt(): string {
  return `Parse the following text and extract SKU information. For each line, extract into JSON with these fields:
- orderNo (注文番号)
- skuCode (SKUコード)
- product (商品名)
- brand (ブランド: Judydoll, Flower Knows, or Other)
- color (カラー)
- quantity (数量)
- channel (チャネル: Online, Offline, Sample, or Fixture)

Return a JSON array. If a field is not found, use empty string.`
}

// Parse task text
export function parseTaskPrompt(): string {
  return `Parse the following text and extract task information. Analyze each item and categorize it as either a "task" (需要执行的工作) or "guide" (操作指南、详细说明、注意事项).

For each item, extract into JSON with these fields:
- category (カテゴリ: "task" 表示任务, "guide" 表示指南/说明)
- title (タイトル) - 任务或指南的名称
- type (種類: 商品撮影, 商品掲載, 在庫確認, 包装, 発送, クレーム対応, その他)
- priority (優先度: 緊急, 高, 中, 低) - 仅对 task 有效
- status (ステータス: 未着手, 着手中, 完了) - 仅对 task 有效
- deadline (期限) - format as YYYY-MM-DD, 仅对 task 有效
- assignee (担当者) - person name, 仅对 task 有效
- notes (詳細/ガイド) - 详细的操作步骤、说明、注意事项等

判断规则:
- 如果是"作业步骤"、"操作方法"、"详细说明"、"注意事项"等 → category: "guide"
- 如果是具体的执行任务（有截止日、负责人）→ category: "task"
- guide 类型的内容把详细信息放在 notes 字段

Return a JSON array. If a field is not found, use appropriate default value.`
}
