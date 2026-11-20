import { useEffect, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { cropToAvatar } from './avatarImage'
import { uploadAvatar, type CsrfToken } from './api'

type Preview = { blob: Blob; url: string }

type Status =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'error'; message: string }

type Props = {
  csrf: CsrfToken
  onAvatarChanged: (url: string) => void
  onLoggedOut: () => void
}

const SAVE_FAILED = 'Could not save the avatar. Try again later.'

function AvatarEditor({ csrf, onAvatarChanged, onLoggedOut }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const latestRequest = useRef(0)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  useEffect(() => {
    if (preview === null) return
    return () => URL.revokeObjectURL(preview.url)
  }, [preview])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (file === undefined) return
    latestRequest.current += 1
    const request = latestRequest.current
    try {
      const blob = await cropToAvatar(file)
      if (request !== latestRequest.current) return
      setPreview({ blob, url: URL.createObjectURL(blob) })
      setStatus({ kind: 'idle' })
    } catch (error: unknown) {
      if (request !== latestRequest.current) return
      console.error('Cannot read the chosen image', error)
      setPreview(null)
      setStatus({ kind: 'error', message: 'Cannot read this image' })
    }
  }

  function handleClose() {
    latestRequest.current += 1
    setPreview(null)
    setStatus({ kind: 'idle' })
  }

  async function handleSave() {
    if (preview === null) return
    setStatus({ kind: 'uploading' })
    try {
      const result = await uploadAvatar(csrf, preview.blob)
      if (result.kind === 'loggedOut') {
        onLoggedOut()
        return
      }
      if (result.kind === 'unavailable') {
        setStatus({ kind: 'error', message: SAVE_FAILED })
        return
      }
      dialogRef.current?.close()
      onAvatarChanged(result.url)
    } catch (error: unknown) {
      console.error('Cannot save the avatar', error)
      setStatus({ kind: 'error', message: SAVE_FAILED })
    }
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    if (status.kind === 'uploading') {
      event.preventDefault()
    }
  }

  const uploading = status.kind === 'uploading'

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Change avatar
      </button>
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onCancel={handleCancel}
        aria-labelledby="avatar-editor-title"
      >
        <h2 id="avatar-editor-title">Change avatar</h2>
        <label htmlFor="avatar-file">Image</label>
        <input
          id="avatar-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {preview !== null && (
          <img
            className="avatar-preview"
            src={preview.url}
            alt="Preview of the new avatar"
            width={200}
            height={200}
          />
        )}
        {status.kind === 'error' && <p role="alert">{status.message}</p>}
        <button type="button" onClick={handleSave} disabled={preview === null || uploading}>
          {uploading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={() => dialogRef.current?.close()} disabled={uploading}>
          Cancel
        </button>
      </dialog>
    </>
  )
}

export default AvatarEditor
