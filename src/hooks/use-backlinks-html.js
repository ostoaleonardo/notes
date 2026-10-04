import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useNotes } from './use-notes'
import { findBacklinks, buildBacklinksHtml } from '@/utils/wiki-links'
import { findUnlinkedMentions, buildUnlinkedMentionsHtml } from '@/utils/unlinked-mentions'

export function useBacklinksHtml(id, enabled) {
    const { t } = useTranslation()
    const { notes, notePaths } = useNotes()

    return useMemo(() => {
        if (!enabled) return ''

        const backlinks = buildBacklinksHtml(findBacklinks(id, notes, notePaths), t('title.backlinks'), notePaths)
        const target = notes.find((note) => note.path === id)
        const mentions = target
            ? buildUnlinkedMentionsHtml(
                findUnlinkedMentions(target, notes, notePaths),
                t('title.unlinked_mentions'),
                t('button.link_mention'),
                notePaths
            )
            : ''

        return backlinks + mentions
    }, [enabled, id, notes, notePaths, t])
}
