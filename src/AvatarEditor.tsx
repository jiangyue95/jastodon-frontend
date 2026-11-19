import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { cropToAvatar } from './avatarImage'

type Preview = { blob: Blob; url: string }

type Status =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'error'; message: string }

function AvatarEditor() {
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

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Change avatar
      </button>
      <dialog ref={dialogRef} onClose={handleClose} aria-labelledby="avatar-editor-title">
        <h2 id="avatar-editor-title">Change avatar</h2>
        <label htmlFor="avatar-file">Image</label>
        <input id="avatar-file" type="file" accept="image/*" onChange={handleFileChange} />
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
        <button type="button" onClick={() => dialogRef.current?.close()}>
          Cancel
        </button>
      </dialog>
    </>
  )
}

export default AvatarEditor
