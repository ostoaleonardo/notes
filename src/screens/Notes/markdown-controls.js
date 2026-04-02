import { StyleSheet, View } from 'react-native'
import { FAB, IconButton, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { AnimatedView, Scroll } from '@/components'
import { Edit, Eye } from '@/icons'
import { MARKDOWN_CONTROLS } from '@/constants'

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
                        {MARKDOWN_CONTROLS.map(({ action, Icon }) => (
                            <IconButton
                                key={action}
                                onPress={() => onRunAction(action)}
                                icon={() => <Icon {...iconLightProps} />}
                            />
                        ))}
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
