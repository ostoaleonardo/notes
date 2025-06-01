import { StyleSheet, View } from 'react-native'
import { FAB, IconButton, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { AnimatedView, Scroll } from '@/components'
import { Edit, Eye, FormaQuote, FormatBold, FormatH1, FormatH2, FormatH3, FormatH4, FormatItalic, FormatStrikethrough, HorizontalRule, Link, Picture, Table } from '@/icons'

export function MarkdownControls({ isEditing, onRunAction, onEditMarkdown }) {
    const { colors } = useTheme()
    const { background, onBackground, surface, primary } = colors

    const iconDarkProps = { color: background }
    const iconLightProps = { color: onBackground }

    return (
        <View
            style={{
                ...styles.container,
                left: isEditing ? 16 : 'auto'
            }}
        >
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
                        style={styles.scroll}
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
                            onPress={() => onRunAction('h2')}
                            icon={() => <FormatH2 {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('h3')}
                            icon={() => <FormatH3 {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('h4')}
                            icon={() => <FormatH4 {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('quote')}
                            icon={() => <FormaQuote {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('hrule')}
                            icon={() => <HorizontalRule {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('image')}
                            icon={() => <Picture {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('link')}
                            icon={() => <Link {...iconLightProps} />}
                        />
                        <IconButton
                            onPress={() => onRunAction('table')}
                            icon={() => <Table {...iconLightProps} />}
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
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        bottom: 64,
        right: 16,
        gap: 16
    },
    scroll: {
        flex: 1
    },
    controls: {
        flexGrow: 1,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    }
})
