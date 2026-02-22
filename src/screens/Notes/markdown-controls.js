import { StyleSheet, View } from 'react-native'
import { FAB, IconButton, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { AnimatedView, Scroll } from '@/components'
import { Code, Edit, Eye, FormaQuote, FormatBold, FormatH1, FormatItalic, FormatStrikethrough } from '@/icons'

export function MarkdownControls({ isEditing, onRunAction, onEditMarkdown }) {
    const { colors } = useTheme()
    const { background, onBackground, surface, primary } = colors

    const iconDarkProps = { color: background }
    const iconLightProps = { color: onBackground }

    return (
        <View style={styles.container}>
            {isEditing && (
                <AnimatedView
                    entering={FadeInRight}
                    exiting={FadeOutRight}
                    style={{
                        ...styles.controls,
                        backgroundColor: surface
                    }}
                >
                    <Scroll
                        horizontal
                        overScrollMode='never'
                        style={{ flex: 1 }}
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
                            onPress={() => onRunAction('strike')}
                            icon={() => <FormatStrikethrough {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('h1')}
                            icon={() => <FormatH1 {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('quote')}
                            icon={() => <FormaQuote {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('code')}
                            icon={() => <Code {...iconLightProps} />}
                        />
                    </Scroll>
                </AnimatedView>
            )}

            <AnimatedView
                entering={FadeInRight}
                exiting={FadeOutRight}
            >
                <FAB
                    mode='flat'
                    animated={false}
                    onPress={onEditMarkdown}
                    style={{ backgroundColor: primary }}
                    icon={() => (
                        isEditing
                            ? <Eye {...iconDarkProps} />
                            : <Edit {...iconDarkProps} />
                    )}
                />
            </AnimatedView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        bottom: 56,
        gap: 16
    },
    controls: {
        flexGrow: 1,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
