import { Linking, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import Markdown from 'react-native-markdown-display'
import { FONTS } from '@/constants'

export function MarkdownContainer({ children, size = 12 }) {
    const { colors } = useTheme()
    const { onBackground, surface, tertiary } = colors

    const fontProps = {
        color: onBackground
    }

    const headingProps = {
        ...fontProps,
        fontFamily: FONTS.nType82Headline
    }

    const bodyProps = {
        ...fontProps,
        fontFamily: FONTS.azeretLight
    }

    const styles = StyleSheet.create({
        // Headers
        heading1: {
            fontSize: size + 20,
            ...headingProps
        },
        heading2: {
            fontSize: size + 12,
            ...headingProps
        },
        heading3: {
            fontSize: size + 6,
            ...headingProps
        },
        heading4: {
            fontSize: size + 4,
            ...headingProps
        },
        heading5: {
            fontSize: size + 2,
            ...headingProps
        },
        heading6: {
            fontSize: size,
            ...headingProps
        },

        // Texts
        body: { ...bodyProps },

        // Emphasis
        strong: {
            ...fontProps,
            fontWeight: 'normal',
            fontFamily: FONTS.azeretMedium
        },
        em: {
            ...fontProps,
            fontStyle: 'normal',
            fontFamily: FONTS.azeretItalic
        },
        s: {
            ...fontProps,
            textDecorationLine: 'line-through'
        },

        // Blockquotes
        blockquote: {
            marginLeft: 0,
            borderLeftWidth: 2,
            borderRadius: 0,
            marginVertical: 8,
            paddingHorizontal: 8,
            borderTopEndRadius: 8,
            borderBottomEndRadius: 8,
            borderColor: tertiary,
            backgroundColor: surface
        },

        // Table
        table: {
            borderColor: onBackground,
            borderRadius: 0,
            borderWidth: 1
        },
        tr: {
            borderColor: onBackground,
            borderBottomWidth: 1,
            flexDirection: 'row'
        },
        thead: {
            fontSize: 12
        },
        tbody: {
            fontSize: 12
        },

        // Code
        code_inline: {
            backgroundColor: surface,
            borderColor: surface,
            color: onBackground,
            borderRadius: 8
        },
        code_block: {
            backgroundColor: surface,
            borderColor: surface,
            color: onBackground,
            borderRadius: 8
        },
        fence: {
            backgroundColor: surface,
            borderColor: surface,
            borderRadius: 4,
            borderWidth: 1,
            padding: 10
        },

        // Horizontal Rule
        hr: {
            backgroundColor: onBackground,
            height: 1,
        },
    })

    const onLinkPress = (url) => {
        url = url.startsWith('http') ? url : 'https://' + url

        Linking.openURL(url).catch((err) => {
            console.error('Failed to open URL:', err)
        })
    }

    return (
        <Markdown
            style={styles}
            onLinkPress={onLinkPress}
        >
            {children}
        </Markdown>
    )
}
