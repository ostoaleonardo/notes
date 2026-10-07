import { Languages } from '@/screens/modals/languages'
import { ModalSheet } from '@/components/modal/modal-sheet'

import { SHEET } from '@/constants/components'

export function LanguagesSheet({ sheet }) {
    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            snapPoints={SHEET.snapPoints.tall}
        >
            <Languages />
        </ModalSheet>
    )
}
