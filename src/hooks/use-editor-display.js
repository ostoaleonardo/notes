import { useEffect, useState } from 'react'

import { useStorage } from './use-storage'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import {
    DEFAULT_EDITOR_AUTOCORRECT,
    DEFAULT_EDITOR_FONT_SIZE,
    DEFAULT_EDITOR_INLINE_TITLE,
    DEFAULT_EDITOR_LINE_NUMBERS,
    DEFAULT_EDITOR_LINE_WIDTH,
    DEFAULT_EDITOR_SPELLCHECK,
    DEFAULT_EDITOR_TAB_SIZE,
    EDITOR_FONT_SIZES,
    EDITOR_LINE_WIDTHS,
    EDITOR_TAB_SIZES,
    EDITOR_TOGGLE
} from '@/constants/editor-display'

const OPTIONS = [
    ['fontSize', STORAGE_KEYS.EDITOR_FONT_SIZE, EDITOR_FONT_SIZES, DEFAULT_EDITOR_FONT_SIZE],
    ['maxWidth', STORAGE_KEYS.EDITOR_LINE_WIDTH, EDITOR_LINE_WIDTHS, DEFAULT_EDITOR_LINE_WIDTH],
    ['lineNumbers', STORAGE_KEYS.EDITOR_LINE_NUMBERS, EDITOR_TOGGLE, DEFAULT_EDITOR_LINE_NUMBERS],
    ['spellcheck', STORAGE_KEYS.EDITOR_SPELLCHECK, EDITOR_TOGGLE, DEFAULT_EDITOR_SPELLCHECK],
    ['autocorrect', STORAGE_KEYS.EDITOR_AUTOCORRECT, EDITOR_TOGGLE, DEFAULT_EDITOR_AUTOCORRECT],
    ['tabSize', STORAGE_KEYS.EDITOR_TAB_SIZE, EDITOR_TAB_SIZES, DEFAULT_EDITOR_TAB_SIZE],
    ['inlineTitle', STORAGE_KEYS.EDITOR_INLINE_TITLE, EDITOR_TOGGLE, DEFAULT_EDITOR_INLINE_TITLE]
]

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
