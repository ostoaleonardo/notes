import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { MarkdownTextInput, parseExpensiMark } from '@expensify/react-native-live-markdown'
import { useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

export function MarkdownInput({ value, setValue, size = 13, ...props }) {
    const { colors } = useTheme()
    const { background, onBackground, primary, tertiary } = colors

    const styles = StyleSheet.create({
        markdown: {
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
            backgroundColor: background
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
        cursorColor: onBackground,
        selectionHandleColor: tertiary,
        selectionColor: onBackground + '33',
        placeholderTextColor: onBackground + '66'
    }

    return (
        <MarkdownTextInput
            multiline
            value={value}
            onChangeText={setValue}
            parser={parseExpensiMark}
            markdownStyle={markdownStyle}
            style={styles.markdown}
            {...inputPros}
            {...props}
        />
    )
}
