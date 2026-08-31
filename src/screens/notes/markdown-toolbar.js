import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { IconButton, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { AnimatedView, Scroll, Separator } from '@/components'
import { Commit, Redo, Tag, Undo } from '@/icons'
import { MARKDOWN_CONTROLS } from '@/constants'

export const MarkdownToolbar = memo(function MarkdownToolbar({
    mode,
    isFocused,
    scope,
    onRunAction,
    actions,
    canUndo,
    canRedo
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const controls = MARKDOWN_CONTROLS.filter((control) => !control.scope || control.scope === scope)
    const showFormatting = mode !== 'read' && isFocused
    const showIdle = !showFormatting

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
                contentContainerStyle={styles.scrollContent}
            >
                {showFormatting && (
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

                {showIdle && (
                    <AnimatedView
                        entering={FadeInRight}
                        exiting={FadeOutRight}
                        style={styles.row}
                    >
                        <IconButton
                            disabled={!canUndo}
                            onPress={() => onRunAction('undo')}
                            icon={(props) => <Undo {...props} />}
                            accessibilityLabel={t('button.undo')}
                        />
                        <IconButton
                            disabled={!canRedo}
                            onPress={() => onRunAction('redo')}
                            icon={(props) => <Redo {...props} />}
                            accessibilityLabel={t('button.redo')}
                        />

                        {scope !== 'template' && (
                            <IconButton
                                onPress={actions?.onOpenTags}
                                icon={(props) => <Tag {...props} />}
                                accessibilityLabel={t('title.tags')}
                            />
                        )}

                        <IconButton
                            onPress={actions?.onOpenVersionHistory}
                            icon={(props) => <Commit {...props} />}
                            accessibilityLabel={t('title.version_history')}
                        />
                    </AnimatedView>
                )}
            </Scroll>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingVertical: 3,
        paddingHorizontal: 4,
        borderTopWidth: 1
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4
    },
    divider: {
        width: 1,
        height: 24,
        marginHorizontal: 4
    }
})
