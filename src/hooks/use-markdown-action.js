import { useCallback, useMemo, useState } from 'react'

export function useMarkdownAction() {
    const [action, setAction] = useState('')
    const [payload, setPayload] = useState(null)

    const run = useCallback((nextAction, nextPayload = null) => {
        setPayload(nextPayload)
        setAction(nextAction)
    }, [])

    const clear = useCallback(() => setAction(''), [])

    return useMemo(() => ({ action, payload, run, clear }), [action, payload, run, clear])
}
