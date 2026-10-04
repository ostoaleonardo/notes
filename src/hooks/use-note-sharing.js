import { useCallback } from 'react'

import { useFiles } from './use-files'
import { useMenuAction } from './use-menu-action'

export function useNoteSharing({ id, flush }) {
    const { exportFile, shareFile } = useFiles()

    const dialog = useMenuAction()

    const onConfirmExport = useCallback(async (format) => {
        await flush()
        exportFile(id, format)
    }, [flush, exportFile, id])

    const onConfirmShare = useCallback(async (format) => {
        await flush()
        shareFile(id, format)
    }, [flush, shareFile, id])

    return {
        dialog,
        onConfirmExport,
        onConfirmShare
    }
}
