export * from '@/ui/tokens/components'

import { BORDER_WIDTH, FONT_SIZE, ICON_SIZE, SIZE, SPACING } from '@/ui/tokens/theme'

export const BADGE = {
    size: ICON_SIZE.md,
    top: SPACING.xs,
    right: SPACING.xs
}

const COLOR_OPTION_SIZE = SIZE.xxl

export const COLOR_OPTION = {
    size: COLOR_OPTION_SIZE,
    borderWidth: BORDER_WIDTH.thick,
    radius: COLOR_OPTION_SIZE / 2,
    width: `${100 / 3}%`
}

export const CARD_GRID = {
    cardHeight: SIZE.xxxxl,
    cardMinWidth: SIZE.xxxl,
    previewFontSize: FONT_SIZE.xs,
    rowGap: SPACING.xxl,
    columnGap: SPACING.lg,
    padding: SPACING.lg
}

export const DRAWER_ITEM = {
    minHeight: SIZE.sm,
    slotSize: SIZE.xs
}
