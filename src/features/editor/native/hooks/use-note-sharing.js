import { useBottomSheet } from '@/shared/hooks/use-bottom-sheet'
import { useFiles } from './use-files'
import { useSingleFlight } from '@/shared/hooks/use-single-flight'

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
