export type CsrfToken = {
  token: string
  headerName: string
  parameterName: string
}

export type CsrfResult =
  | { kind: 'loggedIn'; csrf: CsrfToken }
  | { kind: 'loggedOut' }

export async function fetchCsrf(): Promise<CsrfResult> {
  const response = await fetch('/csrf', { redirect: 'manual' })
  if (response.type === 'opaqueredirect') {
    return { kind: 'loggedOut' }
  }
  if (!response.ok) {
    throw new Error(`GET /csrf answered ${response.status}`)
  }
  const csrf: CsrfToken = await response.json()
  return { kind: 'loggedIn', csrf }
}