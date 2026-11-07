import { useCallback, useRef, useState } from 'react'

import { rememberEmittedValue } from '@/utils/emitted-values'

export function useDomValue(value, onChangeText) {
    const emittedRef = useRef(new Set([value]))
    const [synced, setSynced] = useState({ previous: value, value, nonce: 0 })

    if (synced.previous !== value) {
        const external = !emittedRef.current.has(value)

        setSynced({
            previous: value,
            value: external ? value : synced.value,
            nonce: external ? synced.nonce + 1 : synced.nonce
        })
    }

    const onDomChange = useCallback((text) => {
        rememberEmittedValue(emittedRef.current, text)
        onChangeText(text)
    }, [onChangeText])

    return { domValue: synced.value, valueNonce: synced.nonce, onDomChange }
}
