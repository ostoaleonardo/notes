import { buildPendingRows } from '../pending-rows'
import { CONNECTION_TYPES, PENDING_TABS } from '@/constants/connections'

const summary = {
    orphans: [{ path: 'r::Lonely.md' }, { path: 'p::Beta.md' }],
    unresolved: [{ id: 'missing:ghost' }]
}

describe('build the pending rows', () => {
    test('lists the unlinked notes as note entities', () => {
        expect(buildPendingRows(PENDING_TABS.ORPHANS, summary)).toEqual([
            { type: CONNECTION_TYPES.NOTE, id: 'r::Lonely.md' },
            { type: CONNECTION_TYPES.NOTE, id: 'p::Beta.md' }
        ])
    })

    test('lists the broken links as missing entities', () => {
        expect(buildPendingRows(PENDING_TABS.UNRESOLVED, summary)).toEqual([
            { type: CONNECTION_TYPES.MISSING, id: 'missing:ghost' }
        ])
    })
})
