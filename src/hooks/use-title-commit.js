import { useTranslation } from 'react-i18next'

import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { useTitleLinkWarning } from './use-title-link-warning'

import { DUPLICATE_TITLE_ERROR } from '@/constants/note-errors'

export function useTitleCommit({
    title,
    note,
    titleRef,
    busyRef,
    canCommit = () => true,
    setTitle,
    setNote,
    buildPayload,
    runExclusive,
    saveWithLinkCheck,
    applySaved,
    onSaved
}) {
    const { t } = useTranslation()
    const warnTitleLinks = useTitleLinkWarning()

    const commitTitle = (nextTitle, nextNote = note) => {
        const previousTitle = titleRef.current
        if (!canCommit() || !previousTitle || previousTitle === nextTitle) return

        titleRef.current = nextTitle

        runExclusive(async () => {
            const payload = buildPayload(nextTitle, nextNote)
            if (busyRef) busyRef.current = true

            try {
                const { savedNote, ...saved } = await saveWithLinkCheck(payload, previousTitle)
                const rewritten = savedNote.note !== payload.note

                applySaved(saved)
                onSaved?.(rewritten ? savedNote.note : nextNote)
                if (rewritten) setNote(savedNote.note)
            } catch (error) {
                if (error.code !== DUPLICATE_TITLE_ERROR) throw error

                setTitle(previousTitle)
                showSnackbar(t('notes.title_duplicated'))
                titleRef.current = previousTitle
            } finally {
                if (busyRef) busyRef.current = false
            }
        })
    }

    const onTitleBlur = () => {
        const trimmedTitle = title.trim()

        warnTitleLinks(trimmedTitle)
        commitTitle(trimmedTitle)
    }

    const onRestoreVersion = (version) => {
        setTitle(version.title)
        setNote(version.content)
        commitTitle(version.title.trim(), version.content)
    }

    return { onTitleBlur, onRestoreVersion }
}
