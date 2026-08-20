import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { FAB, IconButton, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { AnimatedView, Scroll, Separator } from '@/components'
import { Edit, Eye } from '@/icons'
import { MARKDOWN_CONTROLS } from '@/constants'

export const MarkdownControls = memo(function MarkdownControls({ isEditing, onRunAction, onEditMarkdown, scope }) {
    const { colors } = useTheme()

    const iconDarkProps = { color: colors.background }
    const controls = MARKDOWN_CONTROLS.filter((control) => !control.scope || control.scope === scope)

    return (
        <View style={styles.container}>
            {isEditing && (
                <AnimatedView
                    entering={FadeInRight}
                    exiting={FadeOutRight}
                    style={{
                        ...styles.controls,
                        backgroundColor: colors.surface
                    }}
                >
                    <Scroll
                        horizontal
                        overScrollMode='never'
                        keyboardShouldPersistTaps='always'
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {controls.map(({ action, Icon, divider }, index) => (
                            divider ? (
                                <Separator
                                    key={index}
                                    style={styles.divider}
                                />
                            ) : (
                                <IconButton
                                    key={action}
                                    onPress={() => onRunAction(action)}
                                    icon={() => <Icon color={colors.onSurface} />}
                                />
                            )
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
                    style={{ backgroundColor: colors.primary }}
                    icon={() => (
                        isEditing
                            ? <Eye {...iconDarkProps} />
                            : <Edit {...iconDarkProps} />
                    )}
                />
            </AnimatedView>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        gap: 16
    },
    controls: {
        flexGrow: 1,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    scrollContent: {
        alignItems: 'center'
    },
    divider: {
        width: 1,
        height: 24,
        marginHorizontal: 4
    }
})
