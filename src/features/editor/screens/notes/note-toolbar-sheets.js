import { memo } from 'react'

import { NoteSearchSheet } from '../../../search/screens/notes/note-search-sheet'
import { RecentNotesSheet } from './recent-notes-sheet'

export const NoteToolbarSheets = memo(({
    recentsSheet,
    searchSheet,
    initialSearch,
    home = false
}) => {
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
