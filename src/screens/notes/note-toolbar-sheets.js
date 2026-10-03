import { memo } from 'react'

import { NoteSearchSheet } from './note-search-sheet'
import { RecentNotesSheet } from './recent-notes-sheet'

export const NoteToolbarSheets = memo(function NoteToolbarSheets({ recentsSheet, searchSheet, initialSearch, home = false }) {
    return (
        <>
            <RecentNotesSheet
                home={home}
                sheet={recentsSheet}
            />

            <NoteSearchSheet
                sheet={searchSheet}
                initialQuery={initialSearch}
            />
        </>
    )
})
