import Avatar from './Avatar'
import AvatarEditor from './AvatarEditor'

type Props = {
  avatarUrl: string | null
}

function ProfileHeader({ avatarUrl }: Props) {
  return (
    <header className="profile-header">
      <Avatar key={avatarUrl} url={avatarUrl} />
      <AvatarEditor />
    </header>
  )
}

export default ProfileHeader
