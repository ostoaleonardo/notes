import { useBottomSheet } from './use-bottom-sheet'
import { useFiles } from './use-files'
import { useSingleFlight } from '@/hooks/use-single-flight'

export function useNoteSharing({ id, flush }) {
    const { exportFile, shareFile } = useFiles()

    const sheet = useBottomSheet()

    const [onConfirmExport] = useSingleFlight(async (format) => {
        await flush()
        exportFile(id, format)
    })

    const [onConfirmShare] = useSingleFlight(async (format) => {
        await flush()
        shareFile(id, format)
    })

    return {
        sheet,
        onConfirmExport,
        onConfirmShare
    }
}
