import { BORDER_WIDTH, FONTS, ICON_SIZE, RADIUS, SPACING } from './theme'

export const BUTTON = {
    size: 44,
    groupGap: SPACING.xxxs
}

export const GROUP_CORNERS = {
    only: { left: RADIUS.xl, right: RADIUS.xl },
    first: { left: RADIUS.xl, right: RADIUS.sm },
    middle: { left: RADIUS.sm, right: RADIUS.sm },
    last: { left: RADIUS.sm, right: RADIUS.xl }
}

export const SPLIT_TRIGGER_RADIUS = {
    inner: RADIUS.xs,
    outer: BUTTON.size / 2,
    open: RADIUS.xl
}

export const ICON_TOGGLE = {
    iconSize: ICON_SIZE.lg,
    iconSizeWithLabel: ICON_SIZE.md,
    labelPaddingHorizontal: SPACING.lg,
    labelPaddingTotal: SPACING.lg * 2,
    gap: SPACING.xs,
    measureOffset: 1000,
    expandDuration: 150
}

export const CHECKBOX = {
    size: 20,
    radius: RADIUS.sm
}

export const SWITCH = {
    track: { width: 52, height: 32, borderWidth: BORDER_WIDTH.thick },
    thumb: { off: 16, on: 24 },
    hitSlop: SPACING.sm
}

export const BADGE = {
    size: 16,
    top: SPACING.xs
}

const COLOR_OPTION_SIZE = 64

export const COLOR_OPTION = {
    size: COLOR_OPTION_SIZE,
    borderWidth: BORDER_WIDTH.thick,
    radius: COLOR_OPTION_SIZE / 2,
    width: `${100 / 3}%`
}

export const SEARCH_INPUT = {
    actionSize: 48
}

export const FILLED_INPUT = {
    minHeight: 56,
    topRadius: RADIUS.xs,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    labelGap: SPACING.xxxs,
    indicatorIdle: 1,
    indicatorFocused: 2
}

export const MENU = {
    maxHeight: 280,
    itemIndent: SPACING.lg,
    paddingHorizontal: SPACING.xxs,
    paddingVertical: SPACING.xxxs / 2,
    groupGap: SPACING.xxxs,
    itemGap: SPACING.xxxs / 2,
    itemRadius: 12,
    iconSize: ICON_SIZE.lg,
    iconToTitle: SPACING.xxs,
    titleToTrailing: SPACING.xxs
}

export const SHEET = {
    topPadding: 64,
    snapPoints: {
        tall: ['50%', '95%'],
        search: ['90%']
    }
}

export const CARD_GRID = {
    cardHeight: 220,
    cardMinWidth: 160,
    previewFontSize: 11,
    rowGap: SPACING.xxl,
    columnGap: SPACING.lg,
    padding: SPACING.lg
}

export const SETTINGS_LIST = {
    itemGap: 3
}

export const EMPTY_STATE = {
    paddingTop: 64
}

export const DIALOG_BUTTON_LABEL_STYLE = {
    fontSize: 12,
    paddingHorizontal: SPACING.sm,
    textTransform: 'uppercase',
    fontFamily: FONTS.azeretLight
}

export const TAG_CHIP = {
    height: 22,
    fontSize: 11,
    paddingHorizontal: SPACING.md
}

export const NODE_STYLE = {
    noteRadius: 18,
    folderRadius: { top: 6, rest: 14 },
    folderTab: { width: 40, height: 9, offset: -8, radius: 7 },
    fileCorner: 11,
    fileRadius: 6,
    borderWidth: 1,
    dashedWidth: 1.5,
    iconSize: ICON_SIZE.md,
    rootIconSize: ICON_SIZE.xxl,
    textSize: 11,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    dimOpacity: 0.26,
    haloInner: 8,
    haloOuter: 18
}

export const BADGE_STYLE = {
    size: 18,
    offset: 6,
    iconSize: ICON_SIZE.sm
}

export const EDGE_STYLE = {
    width: 1.5,
    hotWidth: 2.5,
    opacity: 0.22,
    relationDash: [5, 4]
}

export const HERO_CARD = {
    heroRing: 92,
    heroStroke: 8,
    heroRadius: 32,
    heroTextSize: 34,
    heroTitleSize: 21,
    cardRadius: 28
}

export const ORIGIN_TILE = {
    columns: 4,
    labelSize: 11,
    countSize: 10,
    height: 92,
    folderHeight: 84,
    radius: 22
}

export const RELATIONS_SHEET = {
    listMaxRatio: 0.5,
    titleSize: 20,
    blobSize: 52
}
