import { ICON_SIZE, RADIUS, SPACING } from './theme'

export const HIDDEN_OPACITY = 0

export const BUTTON = {
    size: 44,
    groupGap: SPACING.xxxs
}

export const CONTROL_SIZE = {
    small: 40,
    touch: 48
}

const CONTROL_TOUCH_INSET = (CONTROL_SIZE.touch - CONTROL_SIZE.small) / 2

export const HIT_SLOP = {
    icon: SPACING.md,
    control: {
        top: CONTROL_TOUCH_INSET,
        bottom: CONTROL_TOUCH_INSET
    }
}

export const RIPPLE = {
    iconRadius: ICON_SIZE.lg
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

const FILLED_INPUT_MIN_HEIGHT = 56

export const FILLED_INPUT = {
    minHeight: FILLED_INPUT_MIN_HEIGHT,
    matchContents: { vertical: true },
    hostStyle: { width: '100%', minHeight: FILLED_INPUT_MIN_HEIGHT },
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

export const PLAIN_INPUT = {
    matchContents: { vertical: true },
    hostStyle: { width: '100%' },
    keyboardOptions: { capitalization: 'sentences' }
}

export const SHEET = {
    topPadding: 64,
    snapPoints: {
        tall: ['50%', '95%'],
        search: ['90%']
    }
}
