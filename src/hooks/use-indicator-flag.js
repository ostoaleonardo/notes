import { useEffect, useRef, useState } from 'react'

import { useTimer } from './use-timer'

export function useIndicatorFlag(active, delayMs, minVisibleMs) {
    const [visible, setVisible] = useState(false)
    const shownAtRef = useRef(0)
    const { schedule, cancel } = useTimer()

    useEffect(() => {
        if (active && visible) {
            cancel()
            return
        }

        if (active) {
            schedule(() => {
                shownAtRef.current = Date.now()
                setVisible(true)
            }, delayMs)
            return
        }

        if (!visible) {
            cancel()
            return
        }

        const remaining = Math.max(0, minVisibleMs - (Date.now() - shownAtRef.current))
        schedule(() => setVisible(false), remaining)
    }, [active, visible, delayMs, minVisibleMs, schedule, cancel])

    return visible
}
