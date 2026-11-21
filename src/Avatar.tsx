import { useState } from 'react'

type Props = {
  url: string | null
  size?: number
  alt?: string
}

function Avatar({ url, size = 64, alt = 'Your avatar' }: Props) {
  const [failed, setFailed] = useState(false)
  const style = { width: size, height: size }

  if (url !== null && !failed) {
    return (
      <img
        className="avatar"
        src={url}
        alt={alt}
        width={size}
        height={size}
        style={style}
        onError={() => setFailed(true)}
      />
    )
  }
  if (alt === '') {
    return (
      <div
        className="avatar avatar-placeholder"
        style={style}
        aria-hidden="true"
      />
    )
  }
  return (
    <div
      className="avatar avatar-placeholder"
      style={style}
      role="img"
      aria-label="No avatar"
    />
  )
}

export default Avatar
