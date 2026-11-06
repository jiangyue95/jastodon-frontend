import { useState, type SubmitEvent } from 'react'
import { postNote, type CsrfToken } from './api'

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'posting' }
  | { kind: 'created'; location: string }
  | { kind: 'blank' }
  | { kind: 'error'; message: string }

type Props = {
  csrf: CsrfToken
  onLoggedOut: () => void
}

function ComposeForm({ csrf, onLoggedOut }: Props) {
  const [content, setContent] = useState('')
  const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' })
  const isBlank = content.trim() === ''

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmit({ kind: 'posting' })
    try {
      const result = await postNote(csrf, content)
      if (result.kind === 'loggedOut') {
        onLoggedOut()
        return
      }
      if (result.kind === 'created') {
        setContent('')
      }
      setSubmit(result)
    } catch (error: unknown) {
      setSubmit({ kind: 'error', message: String(error) })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="note-content">New note</label>
      <textarea
        id="note-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={5}
      />
      <button type="submit" disabled={isBlank || submit.kind === 'posting'}>
        Post
      </button>
      {submit.kind === 'created' && (
        <p>Posted: <a href={submit.location}>{submit.location}</a></p>
      )}
      {submit.kind === 'blank' && <p>Write something first.</p>}
      {submit.kind === 'error' && <p>Something went wrong: {submit.message}</p>}
    </form>
  )
}

export default ComposeForm
