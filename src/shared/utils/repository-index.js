import { repositoryEngine } from '@/shared/utils/repository-engine'

import { bootMark } from '@/shared/utils/boot-mark'

import { BOOT_MARKS } from '@/shared/constants/boot-marks'
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

    return async (tree, folders) => {
        if (running) return true
        running = true

        let changed = false

        try {
            await fs.pruneRepositoryIndex(folders.map((folder) => folder.id))

            for (const folder of tree) {
                const stats = await fs.indexRepository(folder.id, folder.uri)

                bootMark(BOOT_MARKS.INDEX_SYNC, { folderId: folder.id, ...stats })
                changed = hasChanges(stats) || changed
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

export const syncRepositoryIndex = createRepositoryIndexSync(repositoryEngine)
