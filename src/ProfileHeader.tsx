import Avatar from './Avatar'
import AvatarEditor from './AvatarEditor'
import type { CsrfToken } from './api'

type Props = {
  avatarUrl: string | null
  csrf: CsrfToken
  onAvatarChanged: (url: string) => void
  onLoggedOut: () => void
}

function ProfileHeader({ avatarUrl, csrf, onAvatarChanged, onLoggedOut }: Props) {
  return (
    <header className="profile-header">
      <Avatar key={avatarUrl} url={avatarUrl} />
      <AvatarEditor
        csrf={csrf}
        onAvatarChanged={onAvatarChanged}
        onLoggedOut={onLoggedOut}
      />
    </header>
  )
}

export default ProfileHeader
