import { useCallback, useState } from 'react'

export function usePressed() {
    const [pressed, setPressed] = useState(false)
    const onPressIn = useCallback(() => setPressed(true), [])
    const onPressOut = useCallback(() => setPressed(false), [])

    return { pressed, onPressIn, onPressOut }
}
