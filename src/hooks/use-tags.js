import { useContext } from 'react'
import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { NoteContext } from '@/context'
import { DEFAULT_TAGS, STORAGE_KEYS, TAGS_FILENAME } from '@/constants'

export function useTags() {
    const { tags, setTags } = useContext(NoteContext)
    const { writeJson } = useFileStorage()
    const { getItem } = useStorage()
    const { activeRepositoryTree } = useRepositories()

    const rootRepositoryUri = activeRepositoryTree[0]?.uri

    const addTag = (tag) => {
        if (tag && !tags.includes(tag)) {
            const localTags = [...tags, tag]
            updateBackup(localTags)
        }
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
        deleteTag,
        updateTag,
        deleteAllTags
    }
}
