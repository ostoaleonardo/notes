import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { useFileStorage } from './use-file-storage'
import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { useHaptics } from './use-haptics'
import { NoteContext } from '@/context/note-context'
import { dedupeTags, hasTag, isSameTag } from '@/utils/tag-names'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { DEFAULT_TAGS } from '@/constants/default-values'
import { TAGS_FILENAME } from '@/constants/file-storage'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function useTags() {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { tags, setTags } = useContext(NoteContext)
    const { writeNotesJson } = useFileStorage()
    const { activeRepositoryTree } = useRepositories()
    const { notes, updateNote } = useNotes()

    const rootRepositoryUri = activeRepositoryTree[0]?.uri

    const persist = (nextTags) => {
        setTags(nextTags)
        if (rootRepositoryUri) writeNotesJson(rootRepositoryUri, TAGS_FILENAME, nextTags)
    }

    const renameInNotes = (previousName, nextName) => {
        const affected = notes.filter((note) => note.tags && hasTag(note.tags, previousName))
        return Promise.all(affected.map((note) => updateNote({
            ...note,
            tags: dedupeTags(note.tags.map((tag) => (isSameTag(tag, previousName) ? nextName : tag)))
        })))
    }

    const removeFromNotes = (name) => {
        const affected = notes.filter((note) => note.tags && hasTag(note.tags, name))
        return Promise.all(affected.map((note) => updateNote({
            ...note,
            tags: note.tags.filter((tag) => !isSameTag(tag, name))
        })))
    }

    const addTag = (name) => {
        if (hasTag(tags, name)) return 'duplicate'

        persist([...tags, name])
        return 'success'
    }

    const saveTag = (name, notify = showSnackbar) => {
        const result = addTag(name.trim())

        if (result === 'duplicate') {
            notify(t('tags.already_added'))
            return 'duplicate'
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
        return 'success'
    }

    const deleteTag = async (name) => {
        persist(tags.filter((tag) => !isSameTag(tag, name)))
        await removeFromNotes(name)
    }

    const updateTag = async (previousName, nextName) => {
        const trimmed = nextName.trim()
        if (!isSameTag(trimmed, previousName) && hasTag(tags, trimmed)) return 'duplicate'

        persist(tags.map((tag) => (isSameTag(tag, previousName) ? trimmed : tag)))
        await renameInNotes(previousName, trimmed)
        return 'success'
    }

    const deleteAllTags = () => {
        setTags(DEFAULT_TAGS)
        if (rootRepositoryUri) writeNotesJson(rootRepositoryUri, TAGS_FILENAME, DEFAULT_TAGS)
    }

    return {
        tags,
        addTag,
        saveTag,
        deleteTag,
        updateTag,
        deleteAllTags
    }
}
