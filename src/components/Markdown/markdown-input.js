import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { MarkdownTextInput, parseExpensiMark } from '@expensify/react-native-live-markdown'
import { useTheme } from 'react-native-paper'
import { TextArea } from '../input'
import { FONTS } from '@/constants'

export function MarkdownInput({ isEditing = false, size = 13, ...props }) {
    const { colors } = useTheme()
    const { background, onBackground, primary, tertiary } = colors

    const styles = StyleSheet.create({
        markdown: {
            padding: 0,
            fontSize: size,
            color: onBackground,
            fontFamily: FONTS.azeretLight
        }
    })

    const markdownStyle = useMemo(() => ({
        h1: {
            fontSize: size * 1.3,
            fontFamily: FONTS.nType82Headline
        },
        link: {
            color: tertiary
        },
        emoji: {
            fontSize: size * 1.2
        },
        blockquote: {
            marginLeft: 6,
            paddingLeft: 6,
            borderWidth: 6,
            borderColor: tertiary,
        },
        code: {
            fontSize: size,
            color: onBackground,
            backgroundColor: onBackground + '1a'
        },
        mentionHere: {
            color: onBackground,
            backgroundColor: tertiary
        },
        mentionUser: {
            color: background,
            backgroundColor: primary
        },
    }), [size, colors])

    const inputPros = {
        readOnly: !isEditing,
        style: styles.markdown,
        cursorColor: onBackground,
        selectionHandleColor: tertiary,
        selectionColor: onBackground + '33',
        placeholderTextColor: onBackground + '66'
    }

    return (
        isEditing ? (
            <TextArea
                {...props}
                {...inputPros}
            />
        ) : (
            <MarkdownTextInput
                multiline
                parser={parseExpensiMark}
                markdownStyle={markdownStyle}
                {...inputPros}
                {...props}
            />
        )
    )
}
