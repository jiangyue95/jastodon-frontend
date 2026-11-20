import { useEffect, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import AvatarCropper from './AvatarCropper'
import { cropToAvatar, type CropArea } from './avatarImage'
import { uploadAvatar, type CsrfToken } from './api'

type Source = { file: File; url: string }

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
  const [source, setSource] = useState<Source | null>(null)
  const [area, setArea] = useState<CropArea | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  useEffect(() => {
    if (source === null) return
    return () => URL.revokeObjectURL(source.url)
  }, [source])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (file === undefined) return
    setSource({ file, url: URL.createObjectURL(file) })
    setArea(null)
    setStatus({ kind: 'idle' })
  }

  function handleClose() {
    latestRequest.current += 1
    setSource(null)
    setArea(null)
    setStatus({ kind: 'idle' })
  }

  async function handleSave() {
    if (source === null || area === null) return
    const request = latestRequest.current
    setStatus({ kind: 'uploading' })
    try {
      const blob = await cropToAvatar(source.file, area)
      const result = await uploadAvatar(csrf, blob)
      if (result.kind === 'loggedOut') {
        onLoggedOut()
        return
      }
      if (result.kind === 'unavailable') {
        if (request === latestRequest.current) {
          setStatus({ kind: 'error', message: SAVE_FAILED })
        }
        return
      }
      dialogRef.current?.close()
      onAvatarChanged(result.url)
    } catch (error: unknown) {
      console.error('Cannot save the avatar', error)
      if (request === latestRequest.current) {
        setStatus({ kind: 'error', message: SAVE_FAILED })
      }
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
        {source !== null && (
          <AvatarCropper key={source.url} imageUrl={source.url} onAreaChange={setArea} />
        )}
        {status.kind === 'error' && <p role="alert">{status.message}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={source === null || area === null || uploading}
        >
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
