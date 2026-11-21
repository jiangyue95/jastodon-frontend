const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const DAYS_LIMIT = 7

export function formatRelativeTime(published: string, now: number): string {
  const timestamp = new Date(published).getTime()
  const delta = now - timestamp

  if (delta < MINUTE) {
    return 'now'
  }
  if (delta < HOUR) {
    return `${Math.floor(delta / MINUTE)}m`
  }
  if (delta < DAY) {
    return `${Math.floor(delta / HOUR)}h`
  }
  if (Math.floor(delta / DAY) <= DAYS_LIMIT) {
    return `${Math.floor(delta / DAY)}d`
  }

  const sameYear = new Date(timestamp).getFullYear() === new Date(now).getFullYear()
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
}
