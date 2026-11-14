import { useCallback, useState } from 'react'

import { useDirectAccess } from './use-direct-access'
import { useNotes } from './use-notes'
import { useStorage } from './use-storage'
import { useStorageEffect } from './use-storage-effect'
import { shouldPromptDirectAccess } from '@/utils/direct-access'

import { DIRECT_ACCESS_MIN_NOTES } from '@/constants/direct-access'
import { STORAGE_BOOLEAN } from '@/constants/storage-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useDirectAccessPrompt() {
    const { setItem } = useStorage()
    const { notes } = useNotes()

    const { granted, request } = useDirectAccess()
    const [dismissed, setDismissed] = useState(true)

    useStorageEffect(STORAGE_KEYS.DIRECT_ACCESS_DISMISSED, (value) => {
        setDismissed(value === STORAGE_BOOLEAN.TRUE)
    })

    const onDismiss = useCallback(() => {
        setDismissed(true)
        setItem(STORAGE_KEYS.DIRECT_ACCESS_DISMISSED, STORAGE_BOOLEAN.TRUE)
    }, [setItem])

    return {
        visible: shouldPromptDirectAccess({
            granted,
            dismissed,
            noteCount: notes.length,
            minNotes: DIRECT_ACCESS_MIN_NOTES
        }),
        onRequest: request,
        onDismiss
    }
}
