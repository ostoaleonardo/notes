import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { showSnackbar } from '@/ui/snackbar/snackbar-host'
import { useExclusiveQueue } from './use-exclusive-queue'
import { useMemoByDeps } from './use-memo-by-deps'
import { useTimer } from './use-timer'

import { AUTOSAVE_DELAY } from '@/constants/debounce'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { logError } from '@/utils/log-error'

export function useAutosave(
    onSave, deps, { delay = AUTOSAVE_DELAY, skip = false } = {}
) {
    const { t } = useTranslation()
    const { runExclusive } = useExclusiveQueue()
    const { schedule, cancel, isPending } = useTimer({ cancelOnUnmount: false })

    const onSaveRef = useRef(onSave)
    onSaveRef.current = onSave

    const depsToken = useMemoByDeps(() => ({}), deps)

    const save = useCallback(async () => {
        try {
            await runExclusive(onSaveRef.current)
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_AUTOSAVING_NOTE, error)
            showSnackbar(t('notes.save_failed'))
        }
    }, [t, runExclusive])

    useEffect(() => {
        if (skip) {
            cancel()
            return
        }

        schedule(save, delay)
    }, [
        skip,
        delay,
        save,
        depsToken,
        schedule,
        cancel
    ])

    const saveRef = useRef(save)
    saveRef.current = save

    useEffect(() => () => {
        if (!isPending()) return

        cancel()
        saveRef.current()
    }, [isPending, cancel])

    const flush = useCallback(async () => {
        cancel()
        await save()
    }, [cancel, save])

    return { flush, runExclusive }
}
