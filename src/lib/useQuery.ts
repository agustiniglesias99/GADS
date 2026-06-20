import { useCallback, useEffect, useRef, useState } from 'react'

interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Minimal data-fetching hook: runs `fn` on mount (and whenever `deps` change),
 * exposing loading / error / data plus `reload` and `setData` for optimistic
 * local updates after a mutation.
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<QueryState<T>>({ data: null, loading: true, error: null })
  const [reloadCount, setReloadCount] = useState(0)

  // Keep the latest fn without making it an effect dependency (callers pass a
  // fresh closure each render; we re-run based on `deps` / `reload` instead).
  const fnRef = useRef(fn)
  useEffect(() => { fnRef.current = fn })

  const reload = useCallback(() => setReloadCount(c => c + 1), [])

  useEffect(() => {
    let active = true
    fnRef.current()
      .then(data => { if (active) setState({ data, loading: false, error: null }) })
      .catch(e => { if (active) setState({ data: null, loading: false, error: e instanceof Error ? e.message : String(e) }) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount])

  const setData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setState(s => ({
      ...s,
      data: typeof updater === 'function' ? (updater as (p: T | null) => T)(s.data) : updater,
    }))
  }, [])

  return { ...state, reload, setData }
}
