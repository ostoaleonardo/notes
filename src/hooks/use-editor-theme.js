import { useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useEditorDisplay } from './use-editor-display'
import { useHeadingFont } from './use-heading-font'
import { useTheme } from '@/ui/hooks/use-theme'
import { toCssHeadingFamily } from '@/utils/heading-font'

import { BUTTON } from '@/constants/components'
import { BODY_FONT_FAMILY, SPACING } from '@/constants/theme'

export function useEditorTheme() {
    const { colors } = useTheme()
    const { bottom } = useSafeAreaInsets()
    const { fontFamily: headingFont } = useHeadingFont()
    const { fontSize, maxWidth, ...display } = useEditorDisplay()

    const theme = useMemo(() => ({
        colors,
        layout: { maxWidth, bottomInset: BUTTON.size + SPACING.lg * 2 + bottom },
        typography: {
            fontSize,
            fontFamily: BODY_FONT_FAMILY,
            headingFontFamily: toCssHeadingFamily(headingFont)
        }
    }), [colors, fontSize, maxWidth, headingFont, bottom])

    return { theme, display }
}
