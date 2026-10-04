import { useState } from 'react'

import { useStorageEffect } from './use-storage-effect'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import {
    DEFAULT_EDITOR_FONT_SIZE,
    DEFAULT_EDITOR_LINE_WIDTH,
    EDITOR_FONT_SIZES,
    EDITOR_LINE_WIDTHS
} from '@/constants/editor-display'

export function useEditorDisplay() {
    const [fontSize, setFontSize] = useState(DEFAULT_EDITOR_FONT_SIZE)
    const [lineWidth, setLineWidth] = useState(DEFAULT_EDITOR_LINE_WIDTH)

    useStorageEffect(STORAGE_KEYS.EDITOR_FONT_SIZE, (value) => {
        if (value in EDITOR_FONT_SIZES) setFontSize(value)
    })

    useStorageEffect(STORAGE_KEYS.EDITOR_LINE_WIDTH, (value) => {
        if (value in EDITOR_LINE_WIDTHS) setLineWidth(value)
    })

    return {
        fontSize: EDITOR_FONT_SIZES[fontSize],
        maxWidth: EDITOR_LINE_WIDTHS[lineWidth]
    }
}
