import { ICON_SIZE, RADIUS, SPACING } from './theme'

export const BUTTON = {
    size: 44,
    groupGap: SPACING.xxxs
}

export const CONTROL_SIZE = {
    small: 40,
    touch: 48
}

export const CONTROL_HIT_SLOP = {
    top: (CONTROL_SIZE.touch - CONTROL_SIZE.small) / 2,
    bottom: (CONTROL_SIZE.touch - CONTROL_SIZE.small) / 2
}

export const SEGMENT_RADIUS = {
    outer: RADIUS.xl,
    inner: RADIUS.md
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
    chipPaddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    measureOffset: 1000,
    expandDuration: 150
}

export const FILLED_INPUT = {
    minHeight: 56,
    keyboardOptions: { capitalization: 'sentences' }
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
