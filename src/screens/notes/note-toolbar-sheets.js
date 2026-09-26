import { NoteSearchSheet } from './note-search-sheet'
import { RecentNotesSheet } from './recent-notes-sheet'

export function NoteToolbarSheets({ recentsSheet, searchSheet, home = false }) {
    return (
        <>
            <RecentNotesSheet
                home={home}
                sheet={recentsSheet}
            />

            <NoteSearchSheet sheet={searchSheet} />
        </>
    )
}
