import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useNotes } from '@/shared/hooks/use-notes'
import { buildBacklinksHtml } from '@/shared/utils/wiki-links'
import { linkIndex } from '@/shared/utils/link-index'
import {
    buildUnlinkedMentionsHtml,
    findUnlinkedMentions,
    getMentionNames
} from '@/features/editor/native/utils/unlinked-mentions'

const EMPTY_HTML = { backlinks: '', mentions: '' }

export function useBacklinksHtml(id, enabled) {
    const { t } = useTranslation()
    const { notes, notePaths } = useNotes()
    const [html, setHtml] = useState(EMPTY_HTML)

    useEffect(() => {
        if (!enabled) {
            setHtml(EMPTY_HTML)
            return undefined
        }

        let cancelled = false
        let task = null
        const target = notes.find((note) => note.path === id)

        const findMentions = async (backlinks) => {
            const linked = new Set(backlinks.map((note) => note.path))
            const pool = await linkIndex.selectPool(
                notes,
                () => linkIndex.mentionCandidates(getMentionNames(target))
            )

            const poolNotes = pool ? notes.filter((note) => pool.has(note.path)) : notes
            const bodies = await linkIndex.loadBodies(poolNotes)

            if (cancelled) return

            const mentions = findUnlinkedMentions(target, notes, { linked, pool, bodies })

            setHtml((current) => ({
                ...current,
                mentions: buildUnlinkedMentionsHtml(
                    mentions,
                    t('title.unlinked_mentions'),
                    t('button.link_mention'),
                    notePaths
                )
            }))
        }

        const load = async () => {
            const backlinks = await linkIndex.findBacklinks(target || { path: id }, notes, notePaths)
            if (cancelled) return

            setHtml({
                backlinks: buildBacklinksHtml(backlinks, t('title.backlinks'), notePaths),
                mentions: ''
            })

            if (target) task = requestIdleCallback(() => findMentions(backlinks))
        }

        load()

        return () => {
            cancelled = true
            if (task !== null) cancelIdleCallback(task)
        }
    }, [enabled, id, notes, notePaths, t])

    return html.backlinks + html.mentions
}
