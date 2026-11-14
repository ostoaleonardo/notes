import { DEFAULT_DELETE_BEHAVIOR, DELETE_BEHAVIORS } from '@/constants/delete-behavior'
import { EDITOR_DISPLAY_OPTIONS } from '@/constants/editor-display'
import { STARTUP_BEHAVIORS } from '@/constants/startup-behavior'
import { STORAGE_KEYS } from '@/constants/storage-keys'

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
