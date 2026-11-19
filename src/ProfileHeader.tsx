import { useState } from 'react'

type Props = {
  avatarUrl: string | null
}

function ProfileHeader({ avatarUrl }: Props) {
  const [failed, setFailed] = useState(false)

  return (
    <header className="profile-header">
      {avatarUrl !== null && !failed ? (
        <img
          className="avatar"
          src={avatarUrl}
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
      )}
    </header>
  )
}

export default ProfileHeader
