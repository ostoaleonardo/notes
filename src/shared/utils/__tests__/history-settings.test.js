import { readHistorySettings } from '../history-settings'

import { MS_PER_DAY, MS_PER_MINUTE } from '@/shared/constants/history-settings'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

const storageWith = (values) => async (key) => values[key] ?? null

describe('read history settings', () => {
    test('falls back to the defaults when nothing is stored', async () => {
        expect(await readHistorySettings(storageWith({}))).toEqual({
            intervalMs: 5 * MS_PER_MINUTE,
            maxAgeMs: 0,
            maxVersions: 200
        })
    })

    test('converts the stored values to milliseconds and counts', async () => {
        const settings = await readHistorySettings(storageWith({
            [STORAGE_KEYS.HISTORY_INTERVAL]: '15',
            [STORAGE_KEYS.HISTORY_RETENTION]: '30',
            [STORAGE_KEYS.HISTORY_MAX_VERSIONS]: '50'
        }))

        expect(settings).toEqual({
            intervalMs: 15 * MS_PER_MINUTE,
            maxAgeMs: 30 * MS_PER_DAY,
            maxVersions: 50
        })
    })

    test('ignores values outside the allowed choices', async () => {
        const settings = await readHistorySettings(storageWith({
            [STORAGE_KEYS.HISTORY_INTERVAL]: '0',
            [STORAGE_KEYS.HISTORY_RETENTION]: '-1',
            [STORAGE_KEYS.HISTORY_MAX_VERSIONS]: 'many'
        }))

        expect(settings).toEqual({
            intervalMs: 5 * MS_PER_MINUTE,
            maxAgeMs: 0,
            maxVersions: 200
        })
    })
})
