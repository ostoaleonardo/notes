import { memo, useCallback, useState } from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip } from 'react-native-paper'
import { FadeInRight, FadeOutRight } from 'react-native-reanimated'

import { AnimatedView } from '@/components/animated/animated-view'
import { Scroll } from '@/components/animated/scroll'
import { Divider } from '@/components/divider/divider'
import { ToolbarSurface } from '@/components/toolbar-surface'

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
import { DIVIDER, SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'
import { MARKDOWN_ACTIONS } from '@/constants/markdown-actions'

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
            onPress: () => onRunAction(MARKDOWN_ACTIONS.UNDO)
        },
        {
            key: TOOLBAR_BUTTON_KEYS.REDO,
            label: 'button.redo',
            icon: Redo,
            disabled: !canRedo,
            onPress: () => onRunAction(MARKDOWN_ACTIONS.REDO)
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
                style={styles.button}
                onPress={onPress}
                testID={TEST_IDS.TOOLBAR_PREFIX + key}
                icon={(props) => <Icon {...props} />}
                accessibilityLabel={t(label)}
                disabled={disabled}
            />
        </Tooltip>
    )

    return (
        <ToolbarSurface>
            <Scroll
                key={formatting ? 'formatting' : 'idle'}
                horizontal
                style={styles.scroll}
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
                                    <Divider
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
        </ToolbarSurface>
    )
})

const styles = StyleSheet.create({
    button: {
        margin: SPACING.xxxs
    },
    scroll: {
        flexGrow: 0
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    scrollContent: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    divider: {
        width: DIVIDER.thickness,
        height: DIVIDER.length,
        marginHorizontal: SPACING.xxs
    }
})
