import { countIndexedNotes } from '@/shared/utils/index-notes'

import { BODYLESS_MIN_NOTES } from '@/shared/constants/body-mode'

export const createBodylessCheck = ({ count, minNotes = BODYLESS_MIN_NOTES }) => async (folderIds) => {
    try {
        return (await count(folderIds)) >= minNotes
    } catch {
        return false
    }
}

export const isBodylessVault = createBodylessCheck({ count: countIndexedNotes })
