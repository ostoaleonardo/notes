import { useCallback, useState } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useMenuAction } from './use-menu-action'
import { useNotes } from './use-notes'
import { useStorage } from './use-storage'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { readDeleteBehavior } from '@/utils/delete-note-files'

import { DEFAULT_DELETE_BEHAVIOR } from '@/constants/delete-behavior'
import { logError } from '@/utils/log-error'

export function useNoteDelete(id, busyRef) {
    const { t } = useTranslation()
    const { deleteNote } = useNotes()
    const { getItem } = useStorage()

    const dialog = useMenuAction()
    const { onOpen: openDialog } = dialog
    const [behavior, setBehavior] = useState(DEFAULT_DELETE_BEHAVIOR)

    const onOpen = useCallback(async () => {
        setBehavior(await readDeleteBehavior(getItem))
        openDialog()
    }, [getItem, openDialog])

    const onConfirm = useCallback(async () => {
        if (busyRef) busyRef.current = true

        try {
            await deleteNote(id)
            router.back()
        } catch (error) {
            if (busyRef) busyRef.current = false
            logError('error deleting note', error)
            showSnackbar(t('notes.delete_failed'))
        }
    }, [deleteNote, busyRef, id, t])

    return {
        visible: dialog.visible,
        behavior,
        onOpen,
        onClose: dialog.onClose,
        onConfirm
    }
}
