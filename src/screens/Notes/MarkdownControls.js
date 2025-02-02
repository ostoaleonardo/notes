import { StyleSheet, View } from 'react-native'
import { FAB, IconButton, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { AnimatedView } from '@/components'
import { Edit, Eye, FormaQuote, FormatBold, FormatItalic, FormatStrikethrough } from '@/icons'

export function MarkdownControls({ isEditing, onRunAction, onEditMarkdown }) {
    const { colors } = useTheme()
    const { background, onBackground, surface } = colors

    const iconDarkProps = { color: background }
    const iconLightProps = { color: onBackground }

    return (
        <AnimatedView
            entering={FadeInRight}
            exiting={FadeOutRight}
            style={styles.container}
        >
            <View style={{ flex: 1 }} />

            {isEditing && (
                <AnimatedView
                    entering={FadeInRight}
                    exiting={FadeOutRight}
                    style={{
                        ...styles.controls,
                        backgroundColor: surface
                    }}
                >
                    <IconButton
                        onPress={() => onRunAction('bold')}
                        icon={() => <FormatBold {...iconLightProps} />}
                    />
                    <IconButton
                        onPress={() => onRunAction('italic')}
                        icon={() => <FormatItalic {...iconLightProps} />}
                    />
                    <IconButton
                        onPress={() => onRunAction('strikethrough')}
                        icon={() => <FormatStrikethrough {...iconLightProps} />}
                    />
                    <IconButton
                        onPress={() => onRunAction('quote')}
                        icon={() => <FormaQuote {...iconLightProps} />}
                    />
                </AnimatedView>
            )}

            <FAB
                mode='outlined'
                onPress={onEditMarkdown}
                icon={() => (
                    isEditing
                        ? <Eye {...iconDarkProps} />
                        : <Edit {...iconDarkProps} />
                )}
            />
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        flexDirection: 'row',
        gap: 16,
        left: 16,
        right: 16,
        bottom: 64
    },
    controls: {
        flexGrow: 1,
        borderRadius: 16,
        flexDirection: 'row',
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    }
})
