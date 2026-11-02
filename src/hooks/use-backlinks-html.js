import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useNotes } from './use-notes'
import { findBacklinks, buildBacklinksHtml } from '@/utils/wiki-links'
import { findUnlinkedMentions, buildUnlinkedMentionsHtml } from '@/utils/unlinked-mentions'

export function useBacklinksHtml(id, enabled) {
    const { t } = useTranslation()
    const { notes, notePaths } = useNotes()
    const [mentionsHtml, setMentionsHtml] = useState('')

    const backlinksHtml = useMemo(() => {
        if (!enabled) return ''

        return buildBacklinksHtml(findBacklinks(id, notes, notePaths), t('title.backlinks'), notePaths)
    }, [enabled, id, notes, notePaths, t])

    useEffect(() => {
        if (!enabled) {
            setMentionsHtml('')
            return undefined
        }

        const task = requestIdleCallback(() => {
            const target = notes.find((note) => note.path === id)

            setMentionsHtml(target
                ? buildUnlinkedMentionsHtml(
                    findUnlinkedMentions(target, notes, notePaths),
                    t('title.unlinked_mentions'),
                    t('button.link_mention'),
                    notePaths
                )
                : '')
        })

        return () => cancelIdleCallback(task)
    }, [enabled, id, notes, notePaths, t])

    return backlinksHtml + mentionsHtml
}
