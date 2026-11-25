import { randomUUID } from 'expo-crypto'

import { repositoryEngine } from '@/shared/utils/repository-engine'
import { DEFAULT_HISTORY_SETTINGS } from '@/shared/utils/history-settings'

export const readVersions = async (rootUri, key) => {
    const raw = await repositoryEngine.versionsRead(rootUri, key)

    return raw ? JSON.parse(raw) : []
}

export const writeVersions = (rootUri, key, versions) => (
    repositoryEngine.versionsWrite(rootUri, key, JSON.stringify(versions))
)

export const deleteVersions = (rootUri, key) => repositoryEngine.versionsDelete(rootUri, key)

export const commitVersion = (rootUri, key, title, content, limits = DEFAULT_HISTORY_SETTINGS) => (
    repositoryEngine.versionsCommit(
        rootUri,
        key,
        title,
        content,
        randomUUID(),
        Date.now(),
        limits.maxVersions,
        limits.maxAgeMs
    )
)

export const migrateLegacyVersions = (folderUri, rootUri, folderPath) => (
    repositoryEngine.versionsMigrateLegacy(rootUri, folderPath)
)
