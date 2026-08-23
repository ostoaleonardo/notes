import { useMemo } from 'react'
import { Linking } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { EnrichedMarkdownText } from 'react-native-enriched-markdown'
import { FONTS, ROUTES, TRANSPARENT } from '@/constants'

export function MarkdownPreview({ value, size = 13 }) {
    const { colors } = useTheme()
    const { background, onBackground, tertiary, onTertiary } = colors

    const titleStyles = {
        fontFamily: FONTS.nType82Headline,
        color: onBackground,
    }

    const paragraphStyles = {
        fontFamily: FONTS.azeretLight,
        color: onBackground,
        fontSize: size
    }

    const markdownStyle = useMemo(() => ({
        h1: {
            ...titleStyles,
            fontSize: size * 2
        },
        h2: {
            ...titleStyles,
            fontSize: size * 1.8
        },
        h3: {
            ...titleStyles,
            fontSize: size * 1.6
        },
        h4: {
            ...titleStyles,
            fontSize: size * 1.5
        },
        h5: {
            ...titleStyles,
            fontSize: size * 1.4
        },
        h6: {
            ...titleStyles,
            fontSize: size * 1.2
        },
        paragraph: {
            ...paragraphStyles
        },
        strong: {
            // Bold style
        },
        em: {
            // Italic style
        },
        strikethrough: {
            // Strikethrough style
        },
        link: {
            color: tertiary,
            underline: true
        },
        blockquote: {
            ...paragraphStyles,
            backgroundColor: background,
            borderColor: tertiary,
            borderWidth: 4
        },
        code: {
            ...paragraphStyles,
            backgroundColor: onBackground + TRANSPARENT[10],
            borderColor: TRANSPARENT.color
        },
        codeBlock: {
            ...paragraphStyles,
            backgroundColor: onBackground + TRANSPARENT[10],
            borderColor: TRANSPARENT.color,
            borderRadius: 8
        },
        list: {
            ...paragraphStyles
        },
        taskList: {
            checkedColor: tertiary,
            checkmarkColor: onTertiary,
            borderColor: onBackground + TRANSPARENT[40],
            checkedTextColor: onBackground + TRANSPARENT[60],
            checkedStrikethrough: true
        },
        table: {
            headerBackgroundColor: TRANSPARENT.color,
            headerFontFamily: FONTS.azeretLight,
            headerTextColor: onBackground,
            rowEvenBackgroundColor: TRANSPARENT.color,
            rowOddBackgroundColor: TRANSPARENT.color,
            borderColor: onBackground,
            ...paragraphStyles,
        },
        image: {
            resizeMode: 'contain',
            borderRadius: 8
        },
        thematicBreak: {
            color: tertiary + TRANSPARENT[30],
            height: 1,
            marginTop: 16,
            marginBottom: 16,
        },
    }), [size, colors])

    return (
        <EnrichedMarkdownText
            flavor='github'
            markdown={value}
            allowFontScaling={true}
            markdownStyle={markdownStyle}
            onLinkPress={({ url }) => Linking.openURL(url)}
            onImagePress={({ url }) => router.push({
                pathname: ROUTES.IMAGE_VIEWER,
                params: { url: encodeURIComponent(url) }
            })}
        />
    )
}
