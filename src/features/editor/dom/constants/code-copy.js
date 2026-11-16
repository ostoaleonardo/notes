import { COPY_ICON_PATH, CHECK_ICON_PATH } from '@/shared/constants/icon-paths'

import { fillTemplate } from '@/shared/utils/fill-template'
import { CODE_ICON_TEMPLATE } from '@/features/editor/dom/constants/icon-markup'

import { ICON_VIEW_BOX, ICON_FILL } from '@/ui/tokens/theme'

export const CODE_BLOCK_CLASS = 'code-block'
export const CODE_COPY_BUTTON_CLASS = 'code-copy'
export const CODE_COPY_DONE_CLASS = 'code-copy-done'
export const CODE_COPY_LABEL = 'Copy code'
export const CODE_COPY_RESET_MS = 1500
export const CODE_COPY_SELECTOR = `.${CODE_COPY_BUTTON_CLASS}`

export const CODE_ICON_SIZE = 22

const buildCodeIcon = (path) => fillTemplate(CODE_ICON_TEMPLATE, {
    size: CODE_ICON_SIZE,
    viewBox: ICON_VIEW_BOX,
    fill: ICON_FILL,
    path
})

export const CODE_COPY_ICON = buildCodeIcon(COPY_ICON_PATH)

export const CODE_COPIED_ICON = buildCodeIcon(CHECK_ICON_PATH)

export const CODE_BLOCK_TEMPLATE = '<div class="{blockClass}">{pre}<button type="button" class="{buttonClass}" aria-label="{label}">{icon}</button></div>'
