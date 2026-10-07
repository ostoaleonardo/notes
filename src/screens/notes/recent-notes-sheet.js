import { RecentNotes } from './recent-notes'
import { FreshSheet } from '@/components/modal/fresh-sheet'

export function RecentNotesSheet({ sheet, home = false }) {
    return (
        <FreshSheet sheet={sheet}>
            <RecentNotes
                home={home}
                onClose={sheet.onClose}
            />
        </FreshSheet>
    )
}
