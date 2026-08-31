import { useMemo } from 'react'
import { Linking } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'
import MarkdownDomEditor from './markdown-dom-editor'
import { useDomFonts, useKatexFonts, useResolvedPreviewMarkdown } from '@/hooks'
import { FONTS, ROUTES, TRANSPARENT } from '@/constants'

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
            onLinkPress={(url) => Linking.openURL(url)}
            onImagePress={(url) => router.push({
                pathname: ROUTES.IMAGE_VIEWER,
                params: { url: encodeURIComponent(url) }
            })}
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
            dom={{
                scrollEnabled: mode === 'read',
                showsVerticalScrollIndicator: false,
                showsHorizontalScrollIndicator: false,
                androidLayerType: 'software',
                style: { flex: 1 }
            }}
        />
    )
}
