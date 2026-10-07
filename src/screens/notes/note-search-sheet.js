import { NoteSearch } from './note-search'
import { FreshSheet } from '@/components/modal/fresh-sheet'

import { SHEET } from '@/constants/components'

export function NoteSearchSheet({ sheet, initialQuery }) {
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
