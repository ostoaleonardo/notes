import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { randomUUID } from 'expo-crypto'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { useHaptics } from './use-haptics'
import { NoteContext } from '@/context/note-context'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { DEFAULT_TAGS } from '@/constants/default-values'
import { TAGS_FILENAME } from '@/constants/file-storage'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function useTags() {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { tags, setTags } = useContext(NoteContext)
    const { writeJson } = useFileStorage()
    const { activeRepositoryTree } = useRepositories()

    const rootRepositoryUri = activeRepositoryTree[0]?.uri

    const addTag = (tag) => {
        const exists = tags.some((existing) => existing.name === tag.name)
        if (exists) return 'duplicate'

        updateBackup((prev) => [...prev, tag])
    }

    const saveTag = (name, notify = showSnackbar) => {
        const result = addTag({
            id: randomUUID(),
            name: name.trim()
        })

        if (result === 'duplicate') {
            notify(t('tags.already_added'))
            return 'duplicate'
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
        return 'success'
    }

    const deleteTag = (id) => {
        updateBackup((prev) => prev.filter((tag) => tag.id !== id))
    }

    const updateTag = (tag) => {
        updateBackup((prev) => prev.map((t) => (t.id === tag.id ? tag : t)))
    }

    const getTag = (id) => {
        return tags.find((tag) => tag.id === id) || {}
    }

    const updateBackup = (updater) => {
        setTags((prev) => {
            const localTags = updater(prev)
            writeJson(rootRepositoryUri, TAGS_FILENAME, localTags)
            return localTags
        })
    }

    const deleteAllTags = () => {
        setTags(DEFAULT_TAGS)
        if (rootRepositoryUri) writeJson(rootRepositoryUri, TAGS_FILENAME, DEFAULT_TAGS)
    }

    return {
        tags,
        getTag,
        addTag,
        saveTag,
        deleteTag,
        updateTag,
        deleteAllTags
    }
}
