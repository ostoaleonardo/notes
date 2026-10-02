import { useCallback, useState } from 'react'

import { useStorage } from './use-storage'
import { useStorageEffect } from './use-storage-effect'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { STORAGE_BOOLEAN } from '@/constants/storage-values'

export function useShowProperties() {
    const { setItem } = useStorage()
    const [propertiesVisible, setPropertiesVisible] = useState(true)

    useStorageEffect(STORAGE_KEYS.SHOW_NOTE_PROPERTIES, (value) => {
        if (value === STORAGE_BOOLEAN.FALSE) setPropertiesVisible(false)
    })

    const onToggleProperties = useCallback(() => {
        setPropertiesVisible((prev) => {
            const next = !prev
            setItem(STORAGE_KEYS.SHOW_NOTE_PROPERTIES, next ? STORAGE_BOOLEAN.TRUE : STORAGE_BOOLEAN.FALSE)
            return next
        })
    }, [setItem])

    return { propertiesVisible, onToggleProperties }
}
