import { useEffect, useEffectEvent, useState } from 'react'
import { fetchNotes, type Note, type Profile } from './api'
import { formatRelativeTime } from './relativeTime'
import { useNow } from './useNow'
import Avatar from './Avatar'

type ListState =
  | { kind: 'loading' }
  | { kind: 'loaded'; notes: Note[]; next: string | null; loadingMore: boolean }
  | { kind: 'error'; message: string }

type Props = {
  profile: Profile
  onLoggedOut: () => void
}

function NoteList({ profile, onLoggedOut }: Props) {
  const [state, setState] = useState<ListState>({ kind: 'loading' })
  const now = useNow()
  const handleLoggedOut = useEffectEvent(onLoggedOut)

  useEffect(() => {
    let ignore = false
    fetchNotes(null)
      .then((result) => {
        if (ignore) return
        if (result.kind === 'loggedOut') {
          handleLoggedOut()
        } else {
          setState({
            kind: 'loaded',
            notes: result.notes,
            next: result.next,
            loadingMore: false,
          })
        }
      })
      .catch((error: unknown) => {
        if (ignore) return
        setState({
          kind: 'error',
          message: String(error),
        })
      })
    return () => {
      ignore = true
    }
  }, [])

  async function loadMore() {
    if (state.kind !== 'loaded' || state.next === null) return
    setState({ ...state, loadingMore: true })
    try {
      const result = await fetchNotes(state.next)
      if (result.kind === 'loggedOut') {
        onLoggedOut()
        return
      }
      setState({
        kind: 'loaded',
        notes: [...state.notes, ...result.notes],
        next: result.next,
        loadingMore: false,
      })
    } catch (error: unknown) {
      setState({
        kind: 'error',
        message: String(error),
      })
    }
  }

  if (state.kind === 'loading') return <p>Loading notes...</p>
  if (state.kind === 'error') return <p>Something went wrong: {state.message}</p>
  if (state.notes.length === 0) return <p>No notes yet.</p>

  return (
    <section aria-label="Your notes">
      <ul className="notes">
        {state.notes.map((note) => (
          <li key={note.id} className="note">
            <Avatar key={profile.avatarUrl} url={profile.avatarUrl} size={40} alt="" />
            <div className="note-body">
              <div className="note-header">
                <span className="note-name">{profile.username}</span>
                <span className="note-handle">@{profile.acct}</span>
                <span aria-hidden="true">·</span>
                <time
                  dateTime={note.published}
                  title={new Date(note.published).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                >
                  {formatRelativeTime(note.published, now)}
                </time>
              </div>
              <p className="note-content">{note.content}</p>
            </div>
          </li>
        ))}
      </ul>
      {state.next !== null && (
        <button type="button" onClick={loadMore} disabled={state.loadingMore}>
          Load more
        </button>
      )}
    </section>
  )
}

export default NoteList
