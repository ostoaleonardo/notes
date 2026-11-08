import { useCallback, useEffect, useRef } from 'react'
import { useNativeState } from '@expo/ui/jetpack-compose'

export function useTextState(value, syncWhileFocused = false) {
    const text = useNativeState(value)
    const focused = useRef(false)
    const latest = useRef(value)
    const typed = useRef(value)
    latest.current = value

    const sync = useCallback(() => {
        if (text.value !== latest.current) text.value = latest.current
    }, [text])

    useEffect(() => {
        if (!focused.current || (syncWhileFocused && value !== typed.current)) sync()
    }, [value, sync, syncWhileFocused])

    const onFocusChanged = useCallback((isFocused) => {
        focused.current = isFocused
        if (!isFocused) sync()
    }, [sync])

    const onTyped = useCallback((next) => {
        typed.current = next
    }, [])

    return { text, onFocusChanged, onTyped }
}
