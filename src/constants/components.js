export * from '@/ui/tokens/components'

import { BORDER_WIDTH, FONT_SIZE, FONTS, ICON_SIZE, SPACING } from '@/ui/tokens/theme'

export const BADGE = {
    size: ICON_SIZE.md,
    top: SPACING.xs
}

const COLOR_OPTION_SIZE = 64

export const COLOR_OPTION = {
    size: COLOR_OPTION_SIZE,
    borderWidth: BORDER_WIDTH.thick,
    radius: COLOR_OPTION_SIZE / 2,
    width: `${100 / 3}%`
}

export const CARD_GRID = {
    cardHeight: 220,
    cardMinWidth: 160,
    previewFontSize: FONT_SIZE.xs,
    rowGap: SPACING.xxl,
    columnGap: SPACING.lg,
    padding: SPACING.lg
}

export const DIALOG_BUTTON_LABEL_STYLE = {
    fontSize: FONT_SIZE.sm,
    paddingHorizontal: SPACING.sm,
    textTransform: 'uppercase',
    fontFamily: FONTS.azeretLight
}

export const DRAWER_ITEM = {
    minHeight: 40,
    slotSize: 32
}
