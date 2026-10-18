import { makeEntity } from '@/utils/connection-model'

import { CONNECTION_TYPES, PENDING_TABS } from '@/constants/connections'

const { NOTE, MISSING } = CONNECTION_TYPES

export const buildPendingRows = (tab, summary) => {
    if (tab === PENDING_TABS.ORPHANS) {
        return summary.orphans.map((note) => makeEntity(NOTE, note.path))
    }

    return summary.unresolved.map((link) => makeEntity(MISSING, link.id))
}
