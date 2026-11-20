import { useEffect, useState } from 'react'
import { fetchCsrf, fetchProfile, type CsrfToken, type Profile } from './api'
import ComposeForm from './ComposeForm'
import NoteList from './NoteList'
import ProfileHeader from './ProfileHeader'

type PageState =
  | { kind: 'loading' }
  | { kind: 'loggedOut' }
  | { kind: 'loggedIn'; csrf: CsrfToken; profile: Profile }
  | { kind: 'error'; message: string }

function App() {
  const [state, setState] = useState<PageState>({ kind: 'loading' })
  const [posted, setPosted] = useState(0)

  useEffect(() => {
    Promise.all([fetchCsrf(), fetchProfile()])
      .then(([csrfResult, profileResult]) => {
        if (csrfResult.kind === 'loggedOut' || profileResult.kind === 'loggedOut') {
          setState({ kind: 'loggedOut' })
          return
        }
        setState({
          kind: 'loggedIn',
          csrf: csrfResult.csrf,
          profile: profileResult.profile
        })
      })
      .catch((error: unknown) => setState({ kind: 'error', message: String(error) }))
  }, [])

  function handleAvatarChanged(avatarUrl: string) {
    setState((current) =>
      current.kind === 'loggedIn'
        ? { ...current, profile: { ...current.profile, avatarUrl } }
        : current,
    )
  }

  if (state.kind === 'loading') {
    return <p>Loading...</p>
  }
  if (state.kind === 'loggedOut') {
    return <a href="/oauth2/authorization/github">Log in with GitHub</a>
  }
  if (state.kind === 'error') {
    return <p>Something went wrong: {state.message}</p>
  }
  return (
    <>
      <ProfileHeader
        avatarUrl={state.profile.avatarUrl}
        csrf={state.csrf}
        onAvatarChanged={handleAvatarChanged}
        onLoggedOut={() => setState({ kind: 'loggedOut' })}
      />
      <ComposeForm
        csrf={state.csrf}
        onLoggedOut={() => setState({ kind: 'loggedOut' })}
        onPosted={() => setPosted((count) => count + 1)}
      />
      <NoteList key={posted} onLoggedOut={() => setState({ kind: 'loggedOut' })} />
    </>
  )
}

export default App
