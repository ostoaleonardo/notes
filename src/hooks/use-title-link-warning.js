import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { hasLinkBreakingChars } from '@/utils/note-filename'

export function useTitleLinkWarning() {
    const { t } = useTranslation()
    const warnedTitleRef = useRef('')

    return useCallback((title) => {
        if (title === warnedTitleRef.current || !hasLinkBreakingChars(title)) return

        warnedTitleRef.current = title
        showSnackbar(t('notes.title_breaks_links'))
    }, [t])
}
