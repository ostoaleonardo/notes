import { BORDER_WIDTH, FONTS, ICON_SIZE, RADIUS, SPACING } from './theme'

export const BUTTON = {
    size: 44,
    groupGap: SPACING.xxxs
}

export const SEGMENT_RADIUS = {
    outer: RADIUS.xl,
    inner: RADIUS.sm
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
    size: 20
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

export const FILLED_INPUT = {
    minHeight: 56
}

export const MENU = {
    maxHeight: 280,
    itemIndent: SPACING.lg,
    paddingHorizontal: SPACING.xxs,
    paddingVertical: SPACING.xxxs / 2,
    groupGap: SPACING.xxxs,
    itemGap: SPACING.xxxs / 2,
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

export const DIALOG_BUTTON_LABEL_STYLE = {
    fontSize: 12,
    paddingHorizontal: SPACING.sm,
    textTransform: 'uppercase',
    fontFamily: FONTS.azeretLight
}

export const DRAWER_ITEM = {
    minHeight: 40,
    slotSize: 32
}
