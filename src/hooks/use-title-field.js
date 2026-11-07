import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useLanguage } from './use-language'
import { useNoteModifiedAt } from './use-note-modified-at'
import { buildNoteMetaLines } from '@/utils/note-meta-label'
import { countWords } from '@/utils/word-count'

import { EDITOR_MODES } from '@/constants/editor-modes'

export function useTitleField({ id, title, note, mode }) {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()
    const modifiedAt = useNoteModifiedAt(id)
    const { words, characters } = countWords(note)
    const showDate = mode === EDITOR_MODES.READ

    const metaLines = useMemo(() => (
        buildNoteMetaLines({
            showDate,
            language: currentLanguage,
            timestamp: modifiedAt,
            dateLabel: t('date.updated'),
            words,
            characters,
            wordsLabel: t('count.words', { count: words }),
            charactersLabel: t('count.characters', { count: characters })
        })
    ), [t, showDate, words, modifiedAt, characters, currentLanguage])

    return useMemo(() => ({
        title,
        titlePlaceholder: t('placeholder.title'),
        metaLines
    }), [title, t, metaLines])
}
