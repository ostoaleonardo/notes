import { useState } from 'react'

import { useStorageEffect } from './use-storage-effect'

import { DEFAULT_PDF_EMBED_MODE, PDF_EMBED_MODES } from '@/constants/pdf-embed'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function usePdfEmbed() {
    const [mode, setMode] = useState(DEFAULT_PDF_EMBED_MODE)

    useStorageEffect(STORAGE_KEYS.PDF_EMBED, (value) => {
        if (Object.values(PDF_EMBED_MODES).includes(value)) setMode(value)
    })

    return mode === PDF_EMBED_MODES.EMBEDDED
}
