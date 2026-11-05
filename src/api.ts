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
  if (response.type === 'opaqueredirect' || response.status === 401) {
    return { kind: 'loggedOut' }
  }
  if (!response.ok) {
    throw new Error(`GET /csrf answered ${response.status}`)
  }
  const csrf: CsrfToken = await response.json()
  return { kind: 'loggedIn', csrf }
}

export type PostResult =
  | { kind: 'created'; location: string }
  | { kind: 'blank' }
  | { kind: 'loggedOut' }

export async function postNote(csrf: CsrfToken, content: string): Promise<PostResult> {
  const response = await fetch('/notes', {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({ content }),
  })
  if (response.type === 'opaqueredirect' || response.status === 401 ||
    response.status === 403) {
    return { kind: 'loggedOut' }
  }
  if (response.status === 400) {
    return { kind: 'blank' }
  }
  if (response.status !== 201) {
    throw new Error(`POST /notes answered ${response.status}`)
  }
  const location = response.headers.get('Location')
  if (location === null) {
    throw new Error('POST /notes answered 201 without a Location')
  }
  return { kind: 'created', location }
}
