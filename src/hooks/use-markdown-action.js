import { useCallback, useMemo, useState } from 'react'

const INITIAL_STATE = { action: '', payload: null, nonce: 0 }

export function useMarkdownAction() {
    const [state, setState] = useState(INITIAL_STATE)

    const run = useCallback((action, payload = null) => {
        setState((current) => ({ action, payload, nonce: current.nonce + 1 }))
    }, [])

    return useMemo(() => ({ ...state, run }), [state, run])
}
