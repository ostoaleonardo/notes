import { useState } from 'react'

import { NoteSearch } from './note-search'
import { ModalSheet } from '@/components/modal/modal-sheet'

import { SHEET_SNAP_POINTS } from '@/constants/sheet'

export function NoteSearchSheet({ sheet }) {
    const [openCount, setOpenCount] = useState(0)

    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            snapPoints={SHEET_SNAP_POINTS.SEARCH}
            onChange={(index) => {
                if (index >= 0) setOpenCount((count) => count + 1)
            }}
        >
            <NoteSearch
                key={openCount}
                onClose={sheet.onClose}
            />
        </ModalSheet>
    )
}
