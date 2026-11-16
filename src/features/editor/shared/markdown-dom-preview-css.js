import { buildDerivedColors } from '../dom/markdown-dom-derived-colors'
import { buildPreviewSyntaxCss } from '../dom/syntax-highlighting/syntax-highlight-style'

import { fillTemplate } from '@/shared/utils/fill-template'
import { PREVIEW_CALLOUT_TEMPLATE, PREVIEW_CSS_TEMPLATE, PREVIEW_HEADING_SIZE_TEMPLATE } from '@/features/editor/shared/constants/preview-css'
import { TRANSPARENT } from '@/shared/constants/themes'
import { CALLOUT_COLORS, CALLOUT_TITLE_CLASS, CALLOUT_TYPE_CLASS_PREFIX } from '@/features/editor/dom/constants/callouts'
import { ATTACH_FILE_ICON_PATH } from '@/shared/constants/icon-paths'
import { HEADING_SCALE } from '@/shared/constants/headings'
import { buildIconMaskUrl } from '@/features/editor/dom/utils/icon-mask'

const ATTACH_FILE_MASK = buildIconMaskUrl(ATTACH_FILE_ICON_PATH)

const buildHeadingSizeCss = (fontSize) => HEADING_SCALE
    .map((scale, index) => fillTemplate(PREVIEW_HEADING_SIZE_TEMPLATE, { level: index + 1, size: fontSize * scale }))
    .join('\n    ')

const buildCalloutCss = () => Object.entries(CALLOUT_COLORS).map(([type, color]) => fillTemplate(
    PREVIEW_CALLOUT_TEMPLATE,
    { typeClass: `${CALLOUT_TYPE_CLASS_PREFIX}${type}`, titleClass: CALLOUT_TITLE_CLASS, color, background: color + TRANSPARENT[10] }
)).join('')

export const buildPreviewCss = ({ colors, dark, typography }) => {
    const {
        onBackground: textColor,
        tertiary: linkColor,
        accentText: linkTextColor,
        background: quoteBackgroundColor,
        codeBackground: codeBackgroundColor,
        codeBlockBackground: codeBlockBackgroundColor,
        thematicBreak: thematicBreakColor,
        surface: surfaceColor
    } = buildDerivedColors(colors)
    const { fontSize, fontFamily, headingFontFamily } = typography

    return fillTemplate(PREVIEW_CSS_TEMPLATE, {
        fontFamily,
        fontSize,
        headingFontFamily,
        textColor,
        textColor5: textColor + TRANSPARENT[5],
        textColor20: textColor + TRANSPARENT[20],
        textColor60: textColor + TRANSPARENT[60],
        linkColor,
        linkColor20: linkColor + TRANSPARENT[20],
        linkColor30: linkColor + TRANSPARENT[30],
        linkTextColor,
        quoteBackgroundColor,
        codeBackgroundColor,
        codeBlockBackgroundColor,
        thematicBreakColor,
        surfaceColor,
        background: colors.background,
        headingSizes: buildHeadingSizeCss(fontSize),
        calloutCss: buildCalloutCss(),
        attachFileMask: ATTACH_FILE_MASK,
        syntaxCss: buildPreviewSyntaxCss({ colors, dark })
    })
}
