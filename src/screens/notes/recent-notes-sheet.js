import { RecentNotes } from './recent-notes'
import { ModalSheet } from '@/components/modal/modal-sheet'

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
