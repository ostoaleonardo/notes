import RepositoryFs from 'repository-fs'

import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { logError } from '@/shared/utils/log-error'

export const createRepositoryIndexSync = (fs) => {
    let running = false

    return async (tree, repositories) => {
        if (running) return
        running = true

        try {
            await fs.pruneRepositoryIndex(repositories.map((repository) => repository.id))

            for (const repository of tree) {
                await fs.indexRepository(repository.id, repository.uri)
            }
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_INDEXING_REPOSITORY, error)
        } finally {
            running = false
        }
    }
}

export const syncRepositoryIndex = createRepositoryIndexSync(RepositoryFs)
