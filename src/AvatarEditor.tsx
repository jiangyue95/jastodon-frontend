import { useRef } from 'react'

function AvatarEditor() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Change avatar
      </button>
      <dialog ref={dialogRef} aria-labelledby="avatar-editor-title">
        <h2 id="avatar-editor-title">Change avatar</h2>
        <button type="button" onClick={() => dialogRef.current?.close()}>
          Cancel
        </button>
      </dialog>
    </>
  )
}

export default AvatarEditor
