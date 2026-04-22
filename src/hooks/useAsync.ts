import { useEffect, useRef, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export function useAsync<T>(fn: () => Promise<T>, deps: ReadonlyArray<unknown> = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true,
  })
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    let cancelled = false
    setState({ data: null, error: null, loading: true })
    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
        setState({ data: null, error: message, loading: false })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
