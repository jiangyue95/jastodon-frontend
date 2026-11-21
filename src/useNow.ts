import { useEffect, useState } from 'react'

const REFRESH_INTERVAL = 60 * 1000

export function useNow(): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return now
}
