export const DRAWER_VIEWS = {
    NOTES: 'notes',
    TEMPLATES: 'templates',
    TAGS: 'tags',
    FILES: 'files'
}

export const DRAWER_VIEW_LABELS = {
    [DRAWER_VIEWS.NOTES]: 'drawer.notes',
    [DRAWER_VIEWS.TEMPLATES]: 'drawer.templates',
    [DRAWER_VIEWS.TAGS]: 'drawer.tags',
    [DRAWER_VIEWS.FILES]: 'drawer.files'
}

export const DEFAULT_DRAWER_VIEW = DRAWER_VIEWS.NOTES

export const DRAWER_ITEM_TYPES = {
    REPOSITORY: 'repository',
    NOTE: 'note',
    TEMPLATE: 'template',
    FOLDER: 'folder'
}

export const DRAWER_TOOLBAR_KEYS = {
    TOGGLE_ALL: 'toggle-all'
}

export const DRAWER_ACTIONS = {
    OPEN: 'OPEN_DRAWER',
    CLOSE: 'CLOSE_DRAWER'
}
