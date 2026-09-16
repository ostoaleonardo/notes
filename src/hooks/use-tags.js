import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { randomUUID } from 'expo-crypto'

import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { useHaptics } from './use-haptics'
import { NoteContext } from '@/context/note-context'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { DEFAULT_TAGS } from '@/constants/default-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { TAGS_FILENAME } from '@/constants/file-storage'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function useTags() {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { tags, setTags } = useContext(NoteContext)
    const { writeJson } = useFileStorage()
    const { getItem } = useStorage()
    const { activeRepositoryTree } = useRepositories()

    const rootRepositoryUri = activeRepositoryTree[0]?.uri

    const addTag = (tag) => {
        const exists = tags.some((existing) => existing.name === tag.name)
        if (exists) return 'duplicate'

        const localTags = [...tags, tag]
        updateBackup(localTags)
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
        const localTags = tags.filter((tag) => tag.id !== id)
        updateBackup(localTags)
    }

    const updateTag = (tag) => {
        const localTags = tags.map((t) => {
            if (t.id === tag.id) return tag
            return t
        })

        updateBackup(localTags)
    }

    const getTag = (id) => {
        return tags.find((tag) => tag.id === id) || {}
    }

    const updateBackup = (localTags) => {
        setTags(localTags)
        writeJson(rootRepositoryUri, TAGS_FILENAME, localTags)
    }

    const deleteAllTags = async () => {
        setTags(DEFAULT_TAGS)

        const repositoriesJson = await getItem(STORAGE_KEYS.REPOSITORIES)
        const activeRepositoryId = await getItem(STORAGE_KEYS.ACTIVE_REPOSITORY)
        const repositories = repositoriesJson ? JSON.parse(repositoriesJson) : []

        let repository = repositories.find((r) => r.id === activeRepositoryId)
        while (repository?.parentId) {
            repository = repositories.find((r) => r.id === repository.parentId)
        }

        if (repository) writeJson(repository.uri, TAGS_FILENAME, DEFAULT_TAGS)
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
