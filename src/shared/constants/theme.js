export * from '@/ui/tokens/theme'

import { BORDER_WIDTH, FONT_SIZE, FONTS, ICON_SIZE } from '@/ui/tokens/theme'

export const Z_INDEX = {
    base: 1,
    dropdown: 10,
    tableMenu: 20
}

export const DIVIDER = {
    thickness: BORDER_WIDTH.thin,
    length: ICON_SIZE.xxl
}

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

export const MONOSPACE_FONT_FAMILY = 'ui-monospace, monospace'

export const BODY_FONT_FAMILY = `${FONTS.azeretLight}, ${MONOSPACE_FONT_FAMILY}`

export const HEADING_FONT_FALLBACK = 'system-ui, sans-serif'

export const DOM_FONT_SIZE = {
    caption: `${FONT_SIZE.sm}px`,
    small: '13px',
    body: '14px'
}

export const INLINE_CODE_STYLE = {
    borderRadius: '4px',
    padding: '0.1em 0.3em'
}
