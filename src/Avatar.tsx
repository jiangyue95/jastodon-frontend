import { useState } from 'react'

type Props = {
  url: string | null
}

function Avatar({ url }: Props) {
  const [failed, setFailed] = useState(false)

  return url !== null && !failed ? (
    <img
      className="avatar"
      src={url}
      alt="Your avatar"
      width={64}
      height={64}
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      className="avatar avatar-placeholder"
      role="img"
      aria-label="No avatar"
    />
  )
}

export default Avatar
