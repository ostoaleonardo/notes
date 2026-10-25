import { useCallback } from 'react'

import { useBottomSheet } from './use-bottom-sheet'
import { useFiles } from './use-files'

export function useNoteSharing({ id, flush }) {
    const { exportFile, shareFile } = useFiles()

    const sheet = useBottomSheet()

    const onConfirmExport = useCallback(async (format) => {
        await flush()
        exportFile(id, format)
    }, [flush, exportFile, id])

    const onConfirmShare = useCallback(async (format) => {
        await flush()
        shareFile(id, format)
    }, [flush, shareFile, id])

    return {
        sheet,
        onConfirmExport,
        onConfirmShare
    }
}
