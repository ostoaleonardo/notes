import { ModalSheet } from '@/components'
import { RecentNotes } from './recent-notes'

export function RecentNotesSheet({ sheet, home = false }) {
    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
        >
            <RecentNotes
                home={home}
                onClose={sheet.onClose}
            />
        </ModalSheet>
    )
}
