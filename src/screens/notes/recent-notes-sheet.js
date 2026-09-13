import { useState } from 'react'

import { RecentNotes } from './recent-notes'
import { ModalSheet } from '@/components/modal/modal-sheet'

export function RecentNotesSheet({ sheet, home = false }) {
    const [openCount, setOpenCount] = useState(0)

    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            onChange={(index) => {
                if (index >= 0) setOpenCount((count) => count + 1)
            }}
        >
            <RecentNotes
                key={openCount}
                home={home}
                onClose={sheet.onClose}
            />
        </ModalSheet>
    )
}
