import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

import { APP_STATES } from '@/constants/app-state'

export function useOnForeground(callback) {
    const callbackRef = useRef(callback)
    callbackRef.current = callback

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === APP_STATES.ACTIVE) callbackRef.current()
        })

        return () => subscription.remove()
    }, [])
}
