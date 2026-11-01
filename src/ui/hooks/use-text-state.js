import { useCallback, useEffect, useRef } from 'react'
import { useNativeState } from '@expo/ui/jetpack-compose'

export function useTextState(value) {
    const text = useNativeState(value)
    const focused = useRef(false)
    const latest = useRef(value)
    latest.current = value

    const sync = useCallback(() => {
        if (text.value !== latest.current) text.value = latest.current
    }, [text])

    useEffect(() => {
        if (!focused.current) sync()
    }, [value, sync])

    const onFocusChanged = useCallback((isFocused) => {
        focused.current = isFocused
        if (!isFocused) sync()
    }, [sync])

    return { text, onFocusChanged }
}
