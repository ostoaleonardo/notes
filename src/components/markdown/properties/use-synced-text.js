import { useEffect, useRef, useState } from 'react'

export const useSyncedText = (value) => {
    const hasFocusRef = useRef(false)
    const [text, setText] = useState(value)

    useEffect(() => {
        if (!hasFocusRef.current) setText(value)
    }, [value])

    return { text, setText, hasFocusRef }
}
