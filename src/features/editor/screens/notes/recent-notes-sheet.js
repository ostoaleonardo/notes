import { useTranslation } from 'react-i18next'

import { RecentNotes } from './recent-notes'
import { FreshSheet } from '@/ui/modal/fresh-sheet'
import { SheetTitle } from '@/ui/modal/sheet-title'

export const RecentNotesSheet = ({ sheet, home = false }) => {
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
