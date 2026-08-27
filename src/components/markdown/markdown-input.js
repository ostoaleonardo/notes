import { Linking } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'
import MarkdownDomEditor from './markdown-dom-editor'
import MarkdownDomPreview from './markdown-dom-preview'
import { useDomFonts, useResolvedPreviewMarkdown } from '@/hooks'
import { FONTS, ROUTES, TRANSPARENT } from '@/constants'

export const MarkdownInput = ({
    isEditing = false,
    size = 13,
    value,
    onChangeText,
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

    const bodyFontFamily = `${FONTS.azeretLight}, ui-monospace, monospace`
    const headingFontFamily = `${FONTS.nType82Headline}, system-ui, sans-serif`

    const resolvedPreviewValue = useResolvedPreviewMarkdown(isEditing ? '' : value)

    if (isEditing) {
        return (
            <MarkdownDomEditor
                value={value}
                onChange={onChangeText}
                action={action}
                payload={payload}
                onActionHandled={onActionHandled}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                title={title}
                onTitleChange={setTitle}
                titlePlaceholder={titlePlaceholder}
                dateLabel={dateLabel}
                fontSize={size}
                fontFamily={bodyFontFamily}
                headingFontFamily={headingFontFamily}
                fonts={fonts}
                textColor={onBackground}
                cursorColor={onBackground}
                selectionColor={onBackground + TRANSPARENT[20]}
                placeholderColor={onBackground + TRANSPARENT[40]}
                dom={{
                    scrollEnabled: false,
                    showsVerticalScrollIndicator: false,
                    showsHorizontalScrollIndicator: false,
                    style: { flex: 1 }
                }}
            />
        )
    }

    return (
        <MarkdownDomPreview
            value={resolvedPreviewValue}
            onLinkPress={(url) => Linking.openURL(url)}
            onImagePress={(url) => router.push({
                pathname: ROUTES.IMAGE_VIEWER,
                params: { url: encodeURIComponent(url) }
            })}
            title={title}
            onTitleChange={setTitle}
            titlePlaceholder={titlePlaceholder}
            dateLabel={dateLabel}
            fontSize={size}
            fontFamily={bodyFontFamily}
            headingFontFamily={headingFontFamily}
            fonts={fonts}
            textColor={onBackground}
            linkColor={tertiary}
            quoteBackgroundColor={background}
            codeBackgroundColor={onBackground + TRANSPARENT[10]}
            thematicBreakColor={tertiary + TRANSPARENT[30]}
            dom={{
                scrollEnabled: true,
                showsVerticalScrollIndicator: false,
                showsHorizontalScrollIndicator: false,
                style: { flex: 1 }
            }}
        />
    )
}
