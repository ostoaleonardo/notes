import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { TextArea } from '../input'
import { MarkdownPreview } from './markdown-preview'
import { FONTS, TRANSPARENT } from '@/constants'

export function MarkdownInput({ isEditing = false, size = 13, ...props }) {
    const { colors } = useTheme()
    const { onBackground, tertiary } = colors

    const styles = StyleSheet.create({
        markdown: {
            padding: 0,
            fontSize: size,
            color: onBackground,
            fontFamily: FONTS.azeretLight
        }
    })

    const inputPros = {
        readOnly: !isEditing,
        style: styles.markdown,
        cursorColor: onBackground,
        selectionHandleColor: tertiary,
        selectionColor: onBackground + TRANSPARENT[20],
        placeholderTextColor: onBackground + TRANSPARENT[40]
    }

    return (
        isEditing ? (
            <TextArea
                {...props}
                {...inputPros}
            />
        ) : (
            <MarkdownPreview
                size={size}
                value={props.value}
            />
        )
    )
}
