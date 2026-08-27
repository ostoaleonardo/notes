import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { IconButton, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { AnimatedView, Scroll, Separator } from '@/components'
import { NoteActions } from './note-actions'
import { Edit, Eye } from '@/icons'
import { MARKDOWN_CONTROLS } from '@/constants'

export const MarkdownControls = memo(function MarkdownControls({ isEditing, isFocused, onRunAction, onEditMarkdown, scope, actions }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const controls = MARKDOWN_CONTROLS.filter((control) => !control.scope || control.scope === scope)
    const showControls = scope === 'template' ? isEditing : isEditing && isFocused
    const showActions = scope !== 'template' && !showControls && actions

    return (
        <View
            style={{
                ...styles.container,
                borderTopColor: colors.outline,
                backgroundColor: colors.background
            }}
        >
            <Scroll
                horizontal
                overScrollMode='never'
                keyboardShouldPersistTaps='always'
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {showControls && (
                    <AnimatedView
                        entering={FadeInRight}
                        exiting={FadeOutRight}
                        style={styles.row}
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
                                    icon={() => <Icon color={colors.onBackground} />}
                                    accessibilityLabel={t(`markdown_action.${action}`)}
                                />
                            )
                        ))}
                    </AnimatedView>
                )}

                {showActions && (
                    <AnimatedView
                        entering={FadeInRight}
                        exiting={FadeOutRight}
                        style={styles.row}
                    >
                        <NoteActions {...actions} />
                    </AnimatedView>
                )}
            </Scroll>

            <IconButton
                onPress={onEditMarkdown}
                accessibilityLabel={t(isEditing ? 'button.preview' : 'button.edit')}
                icon={() => (
                    isEditing
                        ? <Eye color={colors.onBackground} />
                        : <Edit color={colors.onBackground} />
                )}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1
    },
    scroll: {
        flex: 1
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 4
    },
    divider: {
        width: 1,
        height: 24,
        marginHorizontal: 4
    }
})
