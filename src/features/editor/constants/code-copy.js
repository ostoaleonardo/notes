import { COPY_ICON_PATH, CHECK_ICON_PATH } from '@/constants/icon-paths'

import { ICON_VIEW_BOX, ICON_FILL } from '@/ui/tokens/theme'

export const CODE_BLOCK_CLASS = 'code-block'
export const CODE_COPY_BUTTON_CLASS = 'code-copy'
export const CODE_COPY_DONE_CLASS = 'code-copy-done'
export const CODE_COPY_LABEL = 'Copy code'
export const CODE_COPY_RESET_MS = 1500
export const CODE_COPY_SELECTOR = `.${CODE_COPY_BUTTON_CLASS}`

const ICON_ATTRIBUTES = `width="22" height="22" viewBox="${ICON_VIEW_BOX}" fill="${ICON_FILL}"`

export const CODE_COPY_ICON = `<svg ${ICON_ATTRIBUTES}><path d="${COPY_ICON_PATH}"/></svg>`

export const CODE_COPIED_ICON = `<svg ${ICON_ATTRIBUTES}><path d="${CHECK_ICON_PATH}"/></svg>`

export const CODE_BLOCK_TEMPLATE = '<div class="{blockClass}">{pre}<button type="button" class="{buttonClass}" aria-label="{label}">{icon}</button></div>'
