import {
    DEFAULT_HISTORY_INTERVAL,
    DEFAULT_HISTORY_MAX_VERSIONS,
    DEFAULT_HISTORY_RETENTION,
    HISTORY_INTERVAL_MINUTES,
    HISTORY_MAX_VERSIONS,
    HISTORY_RETENTION_DAYS,
    MS_PER_DAY,
    MS_PER_MINUTE
} from '@/shared/constants/history-settings'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback)

const buildHistorySettings = ({ interval, retention, maxVersions }) => ({
    intervalMs: Number(pick(interval, HISTORY_INTERVAL_MINUTES, DEFAULT_HISTORY_INTERVAL)) * MS_PER_MINUTE,
    maxAgeMs: Number(pick(retention, HISTORY_RETENTION_DAYS, DEFAULT_HISTORY_RETENTION)) * MS_PER_DAY,
    maxVersions: Number(pick(maxVersions, HISTORY_MAX_VERSIONS, DEFAULT_HISTORY_MAX_VERSIONS))
})

export const DEFAULT_HISTORY_SETTINGS = buildHistorySettings({})

export const readHistorySettings = async (getItem) => {
    const [interval, retention, maxVersions] = await Promise.all([
        getItem(STORAGE_KEYS.HISTORY_INTERVAL),
        getItem(STORAGE_KEYS.HISTORY_RETENTION),
        getItem(STORAGE_KEYS.HISTORY_MAX_VERSIONS)
    ])

    return buildHistorySettings({ interval, retention, maxVersions })
}
