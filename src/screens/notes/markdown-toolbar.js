import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'

import { AnimatedView } from '@/components/animated/animated-view'
import { Scroll } from '@/components/animated/scroll'
import { Separator } from '@/components/separator/separator'

import { NoteStack } from '@/icons/note-stack'
import { Redo } from '@/icons/redo'
import { Search } from '@/icons/search'
import { Shapes } from '@/icons/shapes'
import { Tag } from '@/icons/tag'
import { Undo } from '@/icons/undo'

import { MARKDOWN_CONTROLS } from '@/constants/markdown-controls'

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
    const formatting = mode !== 'read' && isFocused

    const idleButtons = [
        {
            key: 'undo',
            label: 'button.undo',
            icon: Undo,
            disabled: !canUndo,
            onPress: () => onRunAction('undo')
        },
        {
            key: 'redo',
            label: 'button.redo',
            icon: Redo,
            disabled: !canRedo,
            onPress: () => onRunAction('redo')
        },
        {
            key: 'search',
            label: 'drawer.search',
            icon: Search,
            onPress: actions?.onOpenSearch
        },
        {
            key: 'recent',
            label: 'search.recent',
            icon: NoteStack,
            onPress: actions?.onOpenRecents
        },
        scope !== 'template' && {
            key: 'tags',
            label: 'title.tags',
            icon: Tag,
            onPress: actions?.onOpenTags
        },
        scope !== 'template' && {
            key: 'templates',
            label: 'title.templates',
            icon: Shapes,
            onPress: actions?.onOpenTemplates
        }
    ].filter(Boolean)

    const renderButton = ({
        key, label, icon: Icon, onPress, disabled
    }) => (
        <Tooltip key={key} title={t(label)}>
            <IconButton
                onPress={onPress}
                icon={(props) => <Icon {...props} />}
                accessibilityLabel={t(label)}
                disabled={disabled}
            />
        </Tooltip>
    )

    return (
        <View
            style={{
                ...styles.container,
                borderTopColor: colors.outline,
                backgroundColor: colors.background
            }}
        >
            <Scroll
                key={formatting ? 'formatting' : 'idle'}
                horizontal
                overScrollMode='never'
                keyboardShouldPersistTaps='always'
                contentContainerStyle={styles.scrollContent}
            >
                {formatting && (
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
                            ) : renderButton({
                                key: action,
                                label: `markdown_action.${action}`,
                                icon: Icon,
                                onPress: () => onRunAction(action)
                            })
                        ))}
                    </AnimatedView>
                )}

                {!formatting && (
                    <AnimatedView
                        entering={FadeInRight}
                        exiting={FadeOutRight}
                        style={styles.row}
                    >
                        {idleButtons.map(renderButton)}
                    </AnimatedView>
                )}
            </Scroll>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
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
