import { Languages } from '@/screens/modals/languages'
import { ModalSheet } from '@/components/modal/modal-sheet'

import { SHEET_SNAP_POINTS } from '@/constants/sheet'

export function LanguagesSheet({ sheet }) {
    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            snapPoints={SHEET_SNAP_POINTS.TALL}
        >
            <Languages />
        </ModalSheet>
    )
}
