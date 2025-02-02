import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import Markdown from 'react-native-markdown-display'
import { FONTS } from '@/constants'

export function MarkdownContainer({ children, size = 12 }) {
    const { colors } = useTheme()
    const { background, onBackground } = colors

    const fontProps = {
        color: onBackground
    }

    const headingProps = {
        color: onBackground,
        fontFamily: FONTS.nType82Headline
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
        body: {
            ...fontProps
        },
        strong: {
            fontWeight: 'bold',
            ...fontProps
        },
        em: {
            fontStyle: 'italic',
            ...fontProps
        },
        s: {
            textDecorationLine: 'line-through',
            ...fontProps
        },

        // Table
        table: {
            borderWidth: 1,
            borderRadius: 0,
            borderColor: onBackground,
        },
        tr: {
            borderBottomWidth: 1,
            flexDirection: 'row',
            borderColor: onBackground,
        },
        thead: {
            ...headingProps,
            fontSize: 12
        },
        tbody: {
            ...headingProps,
            fontFamily: FONTS.azeretLight,
            fontSize: 12
        },

        // Code
        code_inline: {
            backgroundColor: background,
            color: onBackground,
            borderRadius: 8,
        },
        code_block: {
            backgroundColor: background,
            color: onBackground,
            borderRadius: 8,
        },
    })

    return (
        <Markdown style={styles}>
            {children}
        </Markdown>
    )
}
