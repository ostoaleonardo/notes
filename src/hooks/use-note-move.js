import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useBottomSheet } from './use-bottom-sheet'
import { useNotes } from './use-notes'
import { useRecentNotes } from './use-recent-notes'
import { useUtils } from './use-utils'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { logError } from '@/utils/log-error'
import { replaceInSet } from '@/utils/replace-in-set'

import { DUPLICATE_TITLE_ERROR } from '@/constants/note-errors'
import { LOG_MESSAGES } from '@/constants/log-messages'

export function useNoteMove({ id, busyRef, flush, onMoved }) {
    const { t } = useTranslation()
    const { moveNote } = useNotes()
    const { pinned, updatePinned } = useUtils()
    const { removeRecent } = useRecentNotes()
    const sheet = useBottomSheet()
    const { onClose } = sheet

    const latest = useRef({})
    latest.current = { id, busyRef, flush, onMoved, moveNote, pinned, updatePinned, removeRecent, t }

    const onSelect = useCallback(async (destinationId) => {
        onClose()

        const current = latest.current
        if (current.busyRef) current.busyRef.current = true

        try {
            await current.flush?.()

            const moved = await current.moveNote(current.id, destinationId)
            if (!moved) return

            if (current.pinned.has(current.id)) {
                current.updatePinned(replaceInSet(current.pinned, current.id, moved.path))
            }

            current.removeRecent(current.id)
            current.onMoved?.(moved)
        } catch (error) {
            if (error.code === DUPLICATE_TITLE_ERROR) {
                showSnackbar(current.t('notes.move.duplicate'))
            } else {
                logError(LOG_MESSAGES.ERROR_MOVING_NOTE, error)
                showSnackbar(current.t('notes.move.failed'))
            }
        } finally {
            if (current.busyRef) current.busyRef.current = false
        }
    }, [onClose])

    return { sheet, onSelect }
}
