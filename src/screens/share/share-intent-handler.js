import { useEffect, useState } from 'react'
import { useShareIntent } from 'expo-share-intent'

import { ShareNotePickerSheet } from './share-note-picker-sheet'
import { ShareSheet } from './share-sheet'
import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useNotes } from '@/hooks/use-notes'
import { useShareDestinations } from '@/hooks/use-share-destinations'
import { buildSharedContent } from '@/utils/shared-note'

export const ShareIntentHandler = () => {
    const sheet = useBottomSheet()
    const pickerSheet = useBottomSheet()
    const { loading } = useNotes()
    const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent()
    const [content, setContent] = useState('')
    const { addToNew, addToDaily, addToNote } = useShareDestinations(content)

    useEffect(() => {
        if (!hasShareIntent || loading) return

        const shared = buildSharedContent(shareIntent)

        resetShareIntent()

        if (!shared) return

        setContent(shared)
        sheet.onOpen()
    }, [hasShareIntent, loading, shareIntent, resetShareIntent, sheet])

    return (
        <>
            <ShareSheet
                sheet={sheet}
                onNew={addToNew}
                onDaily={addToDaily}
                onPickNote={pickerSheet.onOpen}
            />

            <ShareNotePickerSheet
                sheet={pickerSheet}
                onSelect={addToNote}
            />
        </>
    )
}
