import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { showSnackbar } from '@/components/snackbar/snackbar-host'

export function useAutosave(
    onSave, deps, { delay = 500, skip = false } = {}
) {
    const { t } = useTranslation()

    const onSaveRef = useRef(onSave)
    onSaveRef.current = onSave

    const timerRef = useRef(null)

    const save = useCallback(async () => {
        try {
            await onSaveRef.current()
        } catch (error) {
            console.debug('error autosaving note', error)
            showSnackbar(t('notes.save_failed'))
        }
    }, [t])

    useEffect(() => {
        if (skip) return

        timerRef.current = setTimeout(() => {
            timerRef.current = null
            save()
        }, delay)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skip, delay, save, ...deps])

    const flush = useCallback(async () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }

        await save()
    }, [save])

    return { flush }
}
