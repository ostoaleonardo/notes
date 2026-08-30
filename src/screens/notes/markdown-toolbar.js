import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { IconButton, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { AnimatedView, Scroll, Separator } from '@/components'
import { MarkdownModeToggle } from './markdown-mode-toggle'
import { MARKDOWN_CONTROLS } from '@/constants'

export const MarkdownToolbar = memo(function MarkdownToolbar({
    mode,
    isFocused,
    scope,
    onSetMode,
    onRunAction,
    actions
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const controls = MARKDOWN_CONTROLS.filter((control) => !control.scope || control.scope === scope)
    const showControls = scope === 'template' ? mode !== 'read' : mode !== 'read' && isFocused

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
            </Scroll>

            <MarkdownModeToggle
                mode={mode}
                scope={scope}
                onSetMode={onSetMode}
                onOpenTags={actions?.onOpenTags}
                onOpenTemplates={actions?.onOpenTemplates}
                onOpenPassword={actions?.onOpenPassword}
                hasPassword={actions?.hasPassword}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingVertical: 3,
        paddingHorizontal: 4,
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
