import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { useExclusiveQueue } from './use-exclusive-queue'

import { AUTOSAVE_DELAY } from '@/constants/default-values'

export function useAutosave(
    onSave, deps, { delay = AUTOSAVE_DELAY, skip = false } = {}
) {
    const { t } = useTranslation()
    const { runExclusive } = useExclusiveQueue()

    const onSaveRef = useRef(onSave)
    onSaveRef.current = onSave

    const timerRef = useRef(null)

    const save = useCallback(async () => {
        try {
            await runExclusive(onSaveRef.current)
        } catch (error) {
            console.debug('error autosaving note', error)
            showSnackbar(t('notes.save_failed'))
        }
    }, [t, runExclusive])

    useEffect(() => {
        if (skip) {
            timerRef.current = null
            return
        }

        timerRef.current = setTimeout(() => {
            timerRef.current = null
            save()
        }, delay)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skip, delay, save, ...deps])

    const saveRef = useRef(save)
    saveRef.current = save

    useEffect(() => () => {
        if (!timerRef.current) return

        clearTimeout(timerRef.current)
        timerRef.current = null
        saveRef.current()
    }, [])

    const flush = useCallback(async () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }

        await save()
    }, [save])

    return { flush, runExclusive }
}
