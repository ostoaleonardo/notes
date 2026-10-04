import { useState } from 'react'

import { useStorageEffect } from './use-storage-effect'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import {
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

const useOption = (storageKey, options, defaultValue) => {
    const [current, setCurrent] = useState(defaultValue)

    useStorageEffect(storageKey, (value) => {
        if (value in options) setCurrent(value)
    })

    return options[current]
}

export function useEditorDisplay() {
    const fontSize = useOption(STORAGE_KEYS.EDITOR_FONT_SIZE, EDITOR_FONT_SIZES, DEFAULT_EDITOR_FONT_SIZE)
    const maxWidth = useOption(STORAGE_KEYS.EDITOR_LINE_WIDTH, EDITOR_LINE_WIDTHS, DEFAULT_EDITOR_LINE_WIDTH)
    const lineNumbers = useOption(STORAGE_KEYS.EDITOR_LINE_NUMBERS, EDITOR_TOGGLE, DEFAULT_EDITOR_LINE_NUMBERS)
    const spellcheck = useOption(STORAGE_KEYS.EDITOR_SPELLCHECK, EDITOR_TOGGLE, DEFAULT_EDITOR_SPELLCHECK)
    const tabSize = useOption(STORAGE_KEYS.EDITOR_TAB_SIZE, EDITOR_TAB_SIZES, DEFAULT_EDITOR_TAB_SIZE)
    const inlineTitle = useOption(STORAGE_KEYS.EDITOR_INLINE_TITLE, EDITOR_TOGGLE, DEFAULT_EDITOR_INLINE_TITLE)

    return { fontSize, maxWidth, lineNumbers, spellcheck, tabSize, inlineTitle }
}
