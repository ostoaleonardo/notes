import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

export function useOnForeground(callback) {
    const callbackRef = useRef(callback)
    callbackRef.current = callback

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') callbackRef.current()
        })

        return () => subscription.remove()
    }, [])
}
