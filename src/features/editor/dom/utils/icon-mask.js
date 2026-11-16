import { fillTemplate } from '@/shared/utils/fill-template'
import { ICON_FILL, ICON_VIEW_BOX } from '@/shared/constants/theme'
import {
    ICON_MARKUP_TEMPLATE,
    ICON_MASK_SVG_TEMPLATE,
    ICON_MASK_URL_TEMPLATE
} from '@/features/editor/dom/constants/icon-markup'

export const buildIconMaskUrl = (path) => {
    const svg = fillTemplate(ICON_MASK_SVG_TEMPLATE, { viewBox: ICON_VIEW_BOX, path })

    return fillTemplate(ICON_MASK_URL_TEMPLATE, { svg: encodeURIComponent(svg) })
}

export const buildIconMarkup = (path, size) => fillTemplate(
    ICON_MARKUP_TEMPLATE,
    { viewBox: ICON_VIEW_BOX, size, fill: ICON_FILL, path }
)
