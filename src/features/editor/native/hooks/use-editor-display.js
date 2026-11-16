import { useEffect, useState } from 'react'

import { useStorage } from '../../../../hooks/use-storage'

import { EDITOR_DISPLAY_OPTIONS } from '@/constants/editor-display'

const OPTIONS = EDITOR_DISPLAY_OPTIONS.map(({ name, storageKey, options, defaultValue }) => (
    [name, storageKey, options, defaultValue]
))

const KEYS = OPTIONS.map(([, key]) => key)

let lastKnown = null

export const resetEditorDisplayCache = () => {
    lastKnown = null
}

const resolveDisplay = (stored) => Object.fromEntries(OPTIONS.map(([name, key, options, fallback]) => {
    const value = stored[key]

    return [name, options[value in options ? value : fallback]]
}))

const isSameDisplay = (a, b) => OPTIONS.every(([name]) => Object.is(a[name], b[name]))

export function useEditorDisplay() {
    const { multiGet } = useStorage()
    const [display, setDisplay] = useState(() => lastKnown ?? resolveDisplay({}))

    useEffect(() => {
        let cancelled = false

        multiGet(KEYS).then((entries) => {
            if (cancelled) return

            const next = resolveDisplay(Object.fromEntries(entries))
            lastKnown = next
            setDisplay((current) => (isSameDisplay(current, next) ? current : next))
        })

        return () => { cancelled = true }
    }, [multiGet])

    return display
}
