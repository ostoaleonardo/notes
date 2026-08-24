import { useTheme } from 'react-native-paper'
import { StyleSheet, TextInput } from 'react-native'
import { MarkdownPreview } from './markdown-preview'
import { Scroll } from '../animated/scroll'
import { FONTS, TRANSPARENT } from '@/constants'

export function MarkdownInput({ isEditing = false, size = 13, ...props }) {
    const { colors } = useTheme()
    const { onBackground, tertiary } = colors

    const styles = StyleSheet.create({
        markdown: {
            padding: 0,
            fontSize: size,
            color: onBackground,
            lineHeight: size * 2,
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
            <TextInput
                multiline
                textAlignVertical='top'
                {...props}
                {...inputPros}
            />
        ) : (
            <Scroll
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <MarkdownPreview
                    size={size}
                    value={props.value}
                />
            </Scroll>
        )
    )
}
