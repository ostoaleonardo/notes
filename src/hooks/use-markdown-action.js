import { useState } from 'react'

export function useMarkdownAction() {
    const [action, setAction] = useState('')
    const [payload, setPayload] = useState(null)

    const run = (action, payload = null) => {
        setPayload(payload)
        setAction(action)
    }

    const clear = () => setAction('')

    return { action, payload, run, clear }
}
