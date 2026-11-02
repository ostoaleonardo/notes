import { ICON_SIZE, RADIUS, SIZE, SPACING } from './theme'

export const HIDDEN_OPACITY = 0

export const BUTTON = {
    size: SIZE.md,
    groupGap: SPACING.xxxs
}

export const CONTROL_SIZE = {
    small: SIZE.sm,
    touch: SIZE.lg
}

const CONTROL_TOUCH_INSET = (CONTROL_SIZE.touch - CONTROL_SIZE.small) / 2

export const HIT_SLOP = {
    icon: SPACING.md,
    control: {
        top: CONTROL_TOUCH_INSET,
        bottom: CONTROL_TOUCH_INSET
    }
}

export const ICON_BUTTON = {
    appBar: { box: SIZE.lg, tooltip: false },
    noTooltip: { tooltip: false },
    drawer: { icon: ICON_SIZE.xl },
    remove: { tooltip: false, icon: ICON_SIZE.md, box: SIZE.xs }
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

const FILLED_INPUT_MIN_HEIGHT = SIZE.xl

export const FILLED_INPUT = {
    minHeight: FILLED_INPUT_MIN_HEIGHT,
    matchContents: { vertical: true },
    hostStyle: { width: '100%', minHeight: FILLED_INPUT_MIN_HEIGHT },
    keyboardOptions: { capitalization: 'sentences' }
}

export const COMPOSE_DIVIDER = {
    matchContents: { vertical: true },
    hostStyle: { width: '100%' }
}

export const SNACKBAR = {
    matchContents: { vertical: true }
}

export const DIALOG = {
    properties: { usePlatformDefaultWidth: false },
    matchContents: { vertical: true },
    hostStyle: { position: 'absolute', width: '100%' }
}

export const PLAIN_INPUT = {
    matchContents: { vertical: true },
    hostStyle: { width: '100%' },
    keyboardOptions: { capitalization: 'sentences' }
}

export const SHEET = {
    topPadding: SIZE.xxl,
    snapPoints: {
        tall: ['50%', '95%'],
        search: ['90%']
    }
}
