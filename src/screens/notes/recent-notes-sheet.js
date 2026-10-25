import { useTranslation } from 'react-i18next'

import { RecentNotes } from './recent-notes'
import { FreshSheet } from '@/components/modal/fresh-sheet'
import { SheetTitle } from '@/components/modal/sheet-title'

export function RecentNotesSheet({ sheet, home = false }) {
    const { t } = useTranslation()

    return (
        <FreshSheet sheet={sheet}>
            <SheetTitle>{t('search.recent')}</SheetTitle>

            <RecentNotes
                home={home}
                onClose={sheet.onClose}
            />
        </FreshSheet>
    )
}
