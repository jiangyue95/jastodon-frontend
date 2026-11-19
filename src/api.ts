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

export type Note = {
  id: string
  content: string
  published: string
  url: string
}

export type NotesResult =
  | { kind: 'page'; notes: Note[]; next: string | null }
  | { kind: 'loggedOut' }

export async function fetchNotes(cursor: string | null): Promise<NotesResult> {
  const query = cursor === null ? '' : `?${new URLSearchParams({ cursor })}`
  const response = await fetch(`/notes${query}`, { redirect: 'manual' })
  if (response.type === 'opaqueredirect' || response.status === 401) {
    return { kind: 'loggedOut' }
  }
  if (!response.ok) {
    throw new Error(`GET /notes answered ${response.status}`)
  }
  const page: { notes: Note[]; next: string | null } = await response.json()
  return { kind: 'page', notes: page.notes, next: page.next }
}

export type Profile = {
  avatarUrl: string | null
}

export type ProfileResult =
  | { kind: 'profile'; profile: Profile }
  | { kind: 'loggedOut' }

export async function fetchProfile(): Promise<ProfileResult> {
  const response = await fetch('/profile', { redirect: 'manual' })
  if (response.type === 'opaqueredirect' || response.status === 401) {
    return { kind: 'loggedOut' }
  }
  if (!response.ok) {
    throw new Error(`GET /profile answered ${response.status}`)
  }
  const profile: Profile = await response.json()
  return { kind: 'profile', profile }
}

export type UploadAvatarResult =
  | { kind: 'uploaded'; url: string }
  | { kind: 'unavailable' }
  | { kind: 'loggedOut' }

export async function uploadAvatar(csrf: CsrfToken, image: Blob): Promise<UploadAvatarResult> {
  const body = new FormData()
  body.append('avatar', image, 'avatar.png')
  const response = await fetch('/profile/avatar', {
    method: 'POST',
    redirect: 'manual',
    headers: {
      [csrf.headerName]: csrf.token,
    },
    body,
  })
  if (response.type === 'opaqueredirect' || response.status === 401 || response.status === 403) {
    return { kind: 'loggedOut' }
  }
  if (response.status === 503) {
    return { kind: 'unavailable' }
  }
  if (response.status !== 200) {
    throw new Error(`POST /profile/avatar answered ${response.status}`)
  }
  const uploaded: { url: string } = await response.json()
  return { kind: 'uploaded', url: uploaded.url }
}
