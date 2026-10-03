import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useNotes } from './use-notes'
import { findBacklinks, buildBacklinksHtml } from '@/utils/wiki-links'

export function useBacklinksHtml(id, enabled) {
    const { t } = useTranslation()
    const { notes, notePaths } = useNotes()

    return useMemo(() => {
        if (!enabled) return ''

        return buildBacklinksHtml(findBacklinks(id, notes, notePaths), t('title.backlinks'), notePaths)
    }, [enabled, id, notes, notePaths, t])
}
