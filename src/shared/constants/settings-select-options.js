import { DEFAULT_DELETE_BEHAVIOR, DELETE_BEHAVIORS } from '@/shared/constants/delete-behavior'
import { EDITOR_DISPLAY_OPTIONS } from '@/shared/constants/editor-display'
import {
    DEFAULT_HISTORY_INTERVAL,
    DEFAULT_HISTORY_MAX_VERSIONS,
    DEFAULT_HISTORY_RETENTION,
    HISTORY_INTERVAL_MINUTES,
    HISTORY_MAX_VERSIONS,
    HISTORY_RETENTION_DAYS,
    HISTORY_RETENTION_UNLIMITED
} from '@/shared/constants/history-settings'
import { STARTUP_BEHAVIORS } from '@/shared/constants/startup-behavior'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

const STARTUP_SELECT_OPTION = {
    storageKey: STORAGE_KEYS.STARTUP_BEHAVIOR,
    translationKey: 'settings.notes.startup',
    values: Object.values(STARTUP_BEHAVIORS),
    defaultValue: STARTUP_BEHAVIORS.LAST_OPENED
}

const DELETE_BEHAVIOR_SELECT_OPTION = {
    storageKey: STORAGE_KEYS.DELETE_BEHAVIOR,
    translationKey: 'settings.notes.delete',
    values: Object.values(DELETE_BEHAVIORS),
    defaultValue: DEFAULT_DELETE_BEHAVIOR
}

export const NOTES_SELECT_OPTIONS = [STARTUP_SELECT_OPTION, DELETE_BEHAVIOR_SELECT_OPTION]

export const EDITOR_SELECT_OPTIONS = EDITOR_DISPLAY_OPTIONS.map(({ name, options, ...option }) => ({
    ...option,
    values: Object.keys(options)
}))

export const HISTORY_SELECT_OPTIONS = [
    {
        storageKey: STORAGE_KEYS.HISTORY_INTERVAL,
        translationKey: 'settings.history.interval',
        values: HISTORY_INTERVAL_MINUTES,
        defaultValue: DEFAULT_HISTORY_INTERVAL,
        countLabel: true
    },
    {
        storageKey: STORAGE_KEYS.HISTORY_RETENTION,
        translationKey: 'settings.history.retention',
        values: HISTORY_RETENTION_DAYS,
        defaultValue: DEFAULT_HISTORY_RETENTION,
        countLabel: true,
        zeroValue: HISTORY_RETENTION_UNLIMITED
    },
    {
        storageKey: STORAGE_KEYS.HISTORY_MAX_VERSIONS,
        translationKey: 'settings.history.max',
        values: HISTORY_MAX_VERSIONS,
        defaultValue: DEFAULT_HISTORY_MAX_VERSIONS,
        countLabel: true
    }
]
