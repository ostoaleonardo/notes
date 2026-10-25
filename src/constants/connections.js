import { BADGE } from './components'
import { ICON_SIZE, SPACING } from './theme'

export const CONNECTION_TYPES = {
    ROOT: 'root',
    NOTE: 'note',
    FOLDER: 'folder',
    FILE: 'file',
    TAG: 'tag',
    MISSING: 'missing'
}

export const CONNECTION_NODE_KINDS = {
    ROOT: 'root',
    FOLDER: 'folder',
    NOTE: 'note',
    FILE: 'file'
}

export const CONNECTION_SECTIONS = {
    LINKS_OUT: 'out',
    LINKS_IN: 'in',
    TAGS: 'tags',
    FILES: 'files',
    NOTES: 'notes',
    FOLDERS: 'folders',
    RELATED_TAGS: 'related'
}

export const CONNECTION_TAB_LABELS = {
    [CONNECTION_SECTIONS.LINKS_OUT]: 'connections.tabs.out',
    [CONNECTION_SECTIONS.LINKS_IN]: 'connections.tabs.in',
    [CONNECTION_SECTIONS.FILES]: 'connections.tabs.files',
    [CONNECTION_SECTIONS.NOTES]: 'connections.tabs.notes',
    [CONNECTION_SECTIONS.FOLDERS]: 'connections.tabs.folders',
    [CONNECTION_SECTIONS.TAGS]: 'connections.tabs.tags',
    [CONNECTION_SECTIONS.RELATED_TAGS]: 'connections.tabs.related'
}

export const CONNECTION_TYPE_LABELS = {
    [CONNECTION_TYPES.ROOT]: 'connections.types.root',
    [CONNECTION_TYPES.NOTE]: 'connections.types.note',
    [CONNECTION_TYPES.MISSING]: 'connections.types.missing',
    [CONNECTION_TYPES.FOLDER]: 'connections.types.folder',
    [CONNECTION_TYPES.FILE]: 'connections.types.file',
    [CONNECTION_TYPES.TAG]: 'connections.types.tag'
}

export const ORIGIN_TYPES = [
    CONNECTION_TYPES.NOTE,
    CONNECTION_TYPES.FOLDER,
    CONNECTION_TYPES.TAG,
    CONNECTION_TYPES.FILE
]

export const FOLDER_SEPARATOR = '/'
export const ROOT_ENTITY_ID = 'root'

export const HISTORY_LIMIT = 20

export const CONNECTION_LIMITS = {
    topTags: 8
}

export const PENDING_TABS = {
    ORPHANS: 'orphans',
    UNRESOLVED: 'unresolved'
}

export const PENDING_TAB_PARAM = 'tab'

export const RELATION_BADGES = {
    OUT: 'out',
    IN: 'in',
    BOTH: 'both',
    FILES: 'files'
}

export const FOCUS_ACTIONS = {
    ENTER: 'enter',
    UP: 'up',
    JUMP: 'jump',
    PAGE: 'page',
    ORIGIN: 'origin'
}

export const FOCUS = {
    swipeActive: 20,
    pageSize: 6,
    centerSize: 112,
    satelliteWidth: 120,
    satelliteHeight: 48,
    satelliteLines: 2,
    maxAspect: 1.6,
    margin: SPACING.sm,
    pagerReserve: 76,
    idleReserve: SPACING.lg,
    swipeThreshold: 60,
    animationDuration: 320,
    exitDuration: 160,
    edgeDelay: 180,
    crumbHeight: 30,
    crumbFontSize: 10,
    crumbMaxWidth: 140,
    pagerLabelWidth: 56,
    crumbGap: SPACING.xs
}

export const GRAPH_NODE = {
    folderTab: { width: 40, height: 9, offset: -8 },
    fileCorner: 11,
    borderWidth: 1,
    dashedWidth: 1.5,
    dashPattern: '4 3',
    iconSize: ICON_SIZE.md,
    rootIconSize: ICON_SIZE.xxl,
    textSize: 11,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    dimOpacity: 0.26,
    haloInner: 8,
    haloOuter: 18
}

export const GRAPH_BADGE = {
    size: BADGE.size,
    offset: 6,
    iconSize: ICON_SIZE.sm
}

export const GRAPH_EDGE = {
    width: 1.5,
    hotWidth: 2.5,
    opacity: 0.22,
    relationDash: [5, 4]
}

export const SUMMARY_CARD = {
    heroRing: 92,
    heroStroke: 8,
    heroTextSize: 34,
    heroTitleSize: 21
}

export const ORIGIN_TILE = {
    columns: 4,
    labelSize: 11,
    countSize: 10,
    height: 92,
    folderHeight: 84
}

export const RELATIONS_SHEET = {
    listMaxRatio: 0.5,
    titleSize: 20,
    blobSize: 52
}
