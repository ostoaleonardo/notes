import { useTranslation } from 'react-i18next'
import { ModalSheet } from '@/components'
import { RecentNotes } from './recent-notes'

export function RecentNotesSheet({ sheet, home = false }) {
    const { t } = useTranslation()

    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            title={t('search.recent')}
        >
            <RecentNotes
                home={home}
                onClose={sheet.onClose}
            />
        </ModalSheet>
    )
}
