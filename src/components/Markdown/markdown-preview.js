import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import Markdown from 'react-native-markdown-renderer'
import { FONTS, TRANSPARENT } from '@/constants'

export function MarkdownPreview({ value, size = 13 }) {
    const { colors } = useTheme()
    const { onBackground, tertiary } = colors

    const style = useMemo(() => ({
        heading: {
            fontFamily: FONTS.nType82Headline,
            color: onBackground
        },
        headingContainer: {
            marginBottom: 0,
        },
        heading1Container: {
            borderBottomWidth: 0,
            paddingBottom: 0
        },
        heading2Container: {
            borderBottomWidth: 0,
            paddingBottom: 0
        },
        heading1: {
            fontSize: size * 2
        },
        heading2: {
            fontSize: size * 1.8,
            marginBottom: 2
        },
        heading3: {
            fontSize: size * 1.6,
            marginBottom: 4
        },
        heading4: {
            fontSize: size * 1.5,
            marginBottom: 6
        },
        heading5: {
            fontSize: size * 1.4,
            marginBottom: 8
        },
        heading6: {
            fontSize: size * 1.2,
            marginBottom: 10
        },
        // Text
        text: {
            fontFamily: FONTS.azeretLight,
            color: onBackground,
            fontSize: size
        },
        strong: {
            fontFamily: FONTS.azeretMedium,
            fontWeight: 'normal'
        },
        em: {
            fontFamily: FONTS.azeretItalic,
            fontStyle: 'normal'
        },
        strikethrough: {
            textDecorationLine: 'line-through',
        },
        link: {
            color: tertiary,
            textDecorationLine: 'underline'
        },
        blocklink: {
            borderBottomWidth: 1,
            borderColor: tertiary,
        },
        blockquote: {
            borderLeftColor: tertiary,
            borderLeftWidth: 4
        },
        // Code
        codeBlock: {
            backgroundColor: onBackground + TRANSPARENT[10],
            fontFamily: FONTS.azeretMedium,
            color: onBackground,
            borderRadius: 8,
            fontSize: size,
            padding: 8,
        },
        codeInline: {
            backgroundColor: onBackground + TRANSPARENT[10],
            fontFamily: FONTS.azeretMedium,
            color: onBackground,
            fontSize: size
        },
        // Lists
        list: {
            marginBottom: 0
        },
        listUnorderedItemIcon: {
            color: onBackground,
            fontFamily: FONTS.azeretMedium
        },
        listOrderedItemIcon: {
            color: onBackground,
            fontFamily: FONTS.azeretMedium
        },
        // Tables
        table: {
            borderColor: tertiary + TRANSPARENT[10],
        },
        tableHeader: {
            backgroundColor: tertiary + TRANSPARENT[10],
        },
        tableHeaderCell: {
            color: onBackground,
            borderColor: tertiary
        },
        tableRow: {
            borderColor: tertiary + TRANSPARENT[20]
        },
        tableRowCell: {
            color: onBackground,
            borderColor: tertiary + TRANSPARENT[20],
        },
        // Images
        image: {
            flex: 1,
            borderRadius: 8,
            marginVertical: 8,
            resizeMode: 'contain',
            borderWidth: 1,
            borderColor: tertiary + TRANSPARENT[30],
        },
        // Separators
        hr: {
            height: 1,
            marginVertical: 0,
            backgroundColor: tertiary + TRANSPARENT[30]
        }
    }), [size, colors])

    return (
        <Markdown style={style}>
            {value}
        </Markdown>
    )
}
