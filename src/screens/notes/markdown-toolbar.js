import { memo, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'

import { AnimatedView } from '@/components/animated/animated-view'
import { Scroll } from '@/components/animated/scroll'
import { Separator } from '@/components/separator/separator'

import { MarkdownGroupSheet } from './markdown-group-sheet'

import { useBottomSheet } from '@/hooks/use-bottom-sheet'

import { NoteStack } from '@/icons/note-stack'
import { Redo } from '@/icons/redo'
import { Search } from '@/icons/search'
import { Shapes } from '@/icons/shapes'
import { Tag } from '@/icons/tag'
import { Undo } from '@/icons/undo'

import { MARKDOWN_CONTROLS, MARKDOWN_GROUPS } from '@/constants/markdown-controls'
import { EDITOR_MODES } from '@/constants/editor-modes'
import { TEMPLATE_SCOPE, TOOLBAR_BUTTON_KEYS } from '@/constants/toolbar'
import { SPACING } from '@/constants/spacing'

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

    const groupSheet = useBottomSheet()
    const [group, setGroup] = useState(null)
    const { onOpen: openGroup, onClose: closeGroup } = groupSheet

    const onOpenGroup = useCallback((key) => {
        setGroup(key)
        openGroup()
    }, [openGroup])

    const onSelectGroupItem = useCallback((action) => {
        closeGroup()
        onRunAction(action)
    }, [closeGroup, onRunAction])

    const controls = MARKDOWN_CONTROLS.filter((control) => !control.scope || control.scope === scope)
    const formatting = mode !== EDITOR_MODES.READ && isFocused

    const idleButtons = [
        {
            key: TOOLBAR_BUTTON_KEYS.UNDO,
            label: 'button.undo',
            icon: Undo,
            disabled: !canUndo,
            onPress: () => onRunAction('undo')
        },
        {
            key: TOOLBAR_BUTTON_KEYS.REDO,
            label: 'button.redo',
            icon: Redo,
            disabled: !canRedo,
            onPress: () => onRunAction('redo')
        },
        {
            key: TOOLBAR_BUTTON_KEYS.SEARCH,
            label: 'drawer.search',
            icon: Search,
            onPress: actions?.onOpenSearch
        },
        {
            key: TOOLBAR_BUTTON_KEYS.RECENT,
            label: 'search.recent',
            icon: NoteStack,
            onPress: actions?.onOpenRecents
        },
        scope !== TEMPLATE_SCOPE && {
            key: TOOLBAR_BUTTON_KEYS.TAGS,
            label: 'title.tags',
            icon: Tag,
            onPress: actions?.onOpenTags
        },
        scope !== TEMPLATE_SCOPE && {
            key: TOOLBAR_BUTTON_KEYS.TEMPLATES,
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
                        {controls.map(({ action, group: groupKey, Icon, divider }, index) => {
                            if (divider) {
                                return (
                                    <Separator
                                        key={index}
                                        style={styles.divider}
                                    />
                                )
                            }

                            if (groupKey) {
                                return renderButton({
                                    key: groupKey,
                                    label: `markdown_group.${groupKey}`,
                                    icon: MARKDOWN_GROUPS[groupKey].Icon,
                                    onPress: () => onOpenGroup(groupKey)
                                })
                            }

                            return renderButton({
                                key: action,
                                label: `markdown_action.${action}`,
                                icon: Icon,
                                onPress: () => onRunAction(action)
                            })
                        })}
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

            <MarkdownGroupSheet
                sheet={groupSheet}
                group={group}
                onSelect={onSelectGroupItem}
            />
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
        paddingHorizontal: SPACING.xxs
    },
    divider: {
        width: 1,
        height: 24,
        marginHorizontal: SPACING.xxs
    }
})
