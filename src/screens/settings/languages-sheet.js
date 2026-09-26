import { Languages } from '@/screens/modals/languages'
import { ModalSheet } from '@/components/modal/modal-sheet'

export function LanguagesSheet({ sheet }) {
    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            snapPoints={['50%', '95%']}
        >
            <Languages />
        </ModalSheet>
    )
}
