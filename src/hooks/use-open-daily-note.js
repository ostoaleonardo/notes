import { useDailyNote } from './use-daily-note'
import { useSingleFlight } from './use-single-flight'
import { openEditor } from '@/utils/open-editor'

export const useOpenDailyNote = ({ currentId = '', onOpened } = {}) => {
    const openDailyNote = useDailyNote()

    return useSingleFlight(async () => {
        const path = await openDailyNote()
        if (!path) return

        onOpened?.()
        if (path !== currentId) openEditor(path, currentId)
    })
}
