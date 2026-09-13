import { useCallback, useMemo } from 'react'
import { Linking } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'

import MarkdownDomEditor from './markdown-dom-editor'

import { useDomFonts } from '@/hooks/use-dom-fonts'
import { useKatexFonts } from '@/hooks/use-katex-fonts'
import { useResolvedPreviewMarkdown } from '@/hooks/use-resolved-preview-markdown'

import { FONTS, TRANSPARENT } from '@/constants/themes'
import { ROUTES } from '@/constants/routes'

export const MarkdownInput = ({
    mode = 'live',
    size = 13,
    value,
    onChangeText,
    onHistoryChange,
    action,
    payload,
    onActionHandled,
    onFocus,
    onBlur,
    placeholder,
    title,
    setTitle,
    titlePlaceholder,
    dateLabel
}) => {
    const { colors } = useTheme()
    const { background, onBackground, tertiary } = colors
    const fonts = useDomFonts()
    const katexFonts = useKatexFonts()

    const bodyFontFamily = `${FONTS.azeretLight}, ui-monospace, monospace`
    const headingFontFamily = `${FONTS.nType82Headline}, system-ui, sans-serif`

    const { value: previewValue, mediaMap } = useResolvedPreviewMarkdown(value)
    const mediaMapEntries = useMemo(() => [...mediaMap], [mediaMap])

    const onLinkPress = useCallback((url) => Linking.openURL(url), [])

    const onImagePress = useCallback((url) => router.push({
        pathname: ROUTES.IMAGE_VIEWER,
        params: { url: encodeURIComponent(url) }
    }), [])

    const dom = useMemo(() => ({
        scrollEnabled: mode === 'read',
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        androidLayerType: 'software',
        style: { flex: 1 }
    }), [mode])

    return (
        <MarkdownDomEditor
            mode={mode}
            value={value}
            previewValue={previewValue}
            mediaMap={mediaMapEntries}
            onChange={onChangeText}
            onHistoryChange={onHistoryChange}
            action={action}
            payload={payload}
            onActionHandled={onActionHandled}
            onFocus={onFocus}
            onBlur={onBlur}
            onLinkPress={onLinkPress}
            onImagePress={onImagePress}
            placeholder={placeholder}
            title={title}
            onTitleChange={setTitle}
            titlePlaceholder={titlePlaceholder}
            dateLabel={dateLabel}
            fontSize={size}
            fontFamily={bodyFontFamily}
            headingFontFamily={headingFontFamily}
            fonts={fonts}
            katexFonts={katexFonts}
            textColor={onBackground}
            cursorColor={tertiary}
            selectionColor={tertiary + TRANSPARENT[20]}
            placeholderColor={onBackground + TRANSPARENT[40]}
            linkColor={tertiary}
            quoteBackgroundColor={background}
            codeBackgroundColor={onBackground + TRANSPARENT[10]}
            thematicBreakColor={tertiary + TRANSPARENT[30]}
            dom={dom}
        />
    )
}
