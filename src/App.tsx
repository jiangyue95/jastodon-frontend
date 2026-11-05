import { useEffect, useState } from 'react'
import { fetchCsrf, type CsrfToken } from './api'
import ComposeForm from './ComposeForm'

type PageState =
  | { kind: 'loading' }
  | { kind: 'loggedOut' }
  | { kind: 'loggedIn'; csrf: CsrfToken }
  | { kind: 'error'; message: string }

function App() {
  const [state, setState] = useState<PageState>({ kind: 'loading' })

  useEffect(() => {
    fetchCsrf()
      .then((result) => setState(result))
      .catch((error: unknown) => setState({ kind: 'error', message: String(error) }))
  }, [])

  if (state.kind === 'loading') {
    return <p>Loading...</p>
  }
  if (state.kind === 'loggedOut') {
    return <a href="/oauth2/authorization/github">Log in with GitHub</a>
  }
  if (state.kind === 'error') {
    return <p>Something went wrong: {state.message}</p>
  }
  return <ComposeForm csrf={state.csrf} onLoggedOut={() => setState({ kind: 'loggedOut' })} />
}

export default App
