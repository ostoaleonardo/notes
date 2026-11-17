import RepositoryFs from 'repository-fs'

import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { logError } from '@/shared/utils/log-error'

const COUNTED_CHANGES = ['added', 'updated', 'removed']

const hasChanges = (stats) => (
    !stats ||
    COUNTED_CHANGES.some((name) => typeof stats[name] !== 'number') ||
    COUNTED_CHANGES.some((name) => stats[name] > 0)
)

export const createRepositoryIndexSync = (fs) => {
    let running = false

    return async (tree, repositories) => {
        if (running) return true
        running = true

        let changed = false

        try {
            await fs.pruneRepositoryIndex(repositories.map((repository) => repository.id))

            for (const repository of tree) {
                changed = hasChanges(await fs.indexRepository(repository.id, repository.uri)) || changed
            }
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_INDEXING_REPOSITORY, error)
            return true
        } finally {
            running = false
        }

        return changed
    }
}

export const syncRepositoryIndex = createRepositoryIndexSync(RepositoryFs)
