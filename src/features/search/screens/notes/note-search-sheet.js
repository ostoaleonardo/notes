import { NoteSearch } from './note-search'
import { FreshSheet } from '@/ui/modal/fresh-sheet'

import { SHEET } from '@/constants/components'

export const NoteSearchSheet = ({ sheet, initialQuery }) => {
    return (
        <FreshSheet
            sheet={sheet}
            snapPoints={SHEET.snapPoints.search}
        >
            <NoteSearch
                initialQuery={initialQuery}
                onClose={sheet.onClose}
            />
        </FreshSheet>
    )
}
