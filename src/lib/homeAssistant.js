export function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

export function toWebSocketUrl(value) {
  const url = trimTrailingSlash(value)

  if (url.startsWith('https://')) {
    return `wss://${url.slice('https://'.length)}/api/websocket`
  }

  if (url.startsWith('http://')) {
    return `ws://${url.slice('http://'.length)}/api/websocket`
  }

  return `${url}/api/websocket`
}

export function readSavedSettings(storageKey, fallback) {
  const rawValue = window.localStorage.getItem(storageKey)

  if (!rawValue) {
    return fallback
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    const normalizedBaseUrl = normalizeBaseUrl(parsedValue.baseUrl, fallback.baseUrl)
    const normalizedFallbackUrls = normalizeFallbackUrls(parsedValue.fallbackUrls, fallback.fallbackUrls)
    const normalizedToken = typeof parsedValue.token === 'string' && parsedValue.token.trim()
      ? parsedValue.token
      : fallback.token

    return {
      ...fallback,
      ...parsedValue,
      baseUrl: normalizedBaseUrl,
      fallbackUrls: normalizedFallbackUrls,
      token: normalizedToken,
      mappings: {
        ...fallback.mappings,
        ...parsedValue.mappings,
      },
    }
  } catch {
    return fallback
  }
}

export function saveSettings(storageKey, value) {
  window.localStorage.setItem(storageKey, JSON.stringify(value))
}

export async function fetchEntityHistory(baseUrl, token, entityIds, hours = 12) {
  const start = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  const historyUrl = `${trimTrailingSlash(baseUrl)}/api/history/period/${encodeURIComponent(start)}?filter_entity_id=${encodeURIComponent(entityIds.join(','))}&minimal_response&no_attributes&significant_changes_only`
  const response = await fetch(historyUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`History request failed (${response.status}).`)
  }

  return response.json()
}

function normalizeBaseUrl(value, fallback) {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmedValue = value.trim()

  if (!trimmedValue || trimmedValue.startsWith('/ha-api')) {
    return fallback
  }

  return trimmedValue
}

function normalizeFallbackUrls(value, fallback) {
  if (!Array.isArray(value)) {
    return fallback
  }

  const nextUrls = value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item && !item.startsWith('/ha-api'))

  return nextUrls.length ? nextUrls : fallback
}
