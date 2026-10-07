import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useNoteActionsMenu } from './use-note-actions-menu'
import { useTemplateActionsMenu } from './use-template-actions-menu'
import { ActionMenuItem } from '@/components/menu/action-menu-item'
import { MenuGroup } from '@/components/menu/menu-group'
import { SplitButton } from '@/components/button/split-button'

import { useMenuAction } from '@/hooks/use-menu-action'

import { Book } from '@/icons/book'
import { Edit } from '@/icons/edit'
import { EditNote } from '@/icons/edit-note'
import { Search } from '@/icons/search'

import { EDITOR_MODES } from '@/constants/editor-modes'
import { TEMPLATE_SCOPE } from '@/constants/toolbar'
import { TEST_IDS } from '@/constants/test-ids'

export const MarkdownModeToggle = ({
    mode,
    onSetMode,
    scope,
    isFocused,
    search,
    onOpenPlaceholders,
    onOpenVersionHistory,
    onOpenOutline,
    onOpenOutgoingLinks,
    onOpenSharingDialog,
    onOpenDeleteDialog,
    showBacklinks,
    onToggleShowBacklinks
}) => {
    const { t } = useTranslation()
    const read = mode === EDITOR_MODES.READ

    const { visible, onOpen, onClose, trigger } = useMenuAction()

    const noteActionsGroups = useNoteActionsMenu({
        onTrigger: trigger,
        onSetMode,
        onOpenVersionHistory,
        onOpenOutline,
        onOpenOutgoingLinks,
        onOpenSharingDialog,
        onOpenDeleteDialog,
        showBacklinks,
        onToggleShowBacklinks
    })

    const templateActionsGroups = useTemplateActionsMenu({
        onTrigger: trigger,
        onSetMode,
        onOpenPlaceholders,
        onOpenVersionHistory,
        onOpenDeleteDialog
    })

    const actionGroups = scope === TEMPLATE_SCOPE ? templateActionsGroups : noteActionsGroups

    const searchGroup = !isFocused && [
        <ActionMenuItem
            key='find'
            title={t('button.find')}
            icon={Search}
            action={search.onOpenSearch}
            onTrigger={trigger}
        />,
        mode !== EDITOR_MODES.READ && (
            <ActionMenuItem
                key='replace'
                title={t('button.replace')}
                icon={Edit}
                action={search.onOpenReplace}
                onTrigger={trigger}
            />
        )
    ].filter(Boolean)

    const onPrimaryPress = useCallback(
        () => onSetMode(read ? EDITOR_MODES.LIVE : EDITOR_MODES.READ),
        [onSetMode, read]
    )

    const groups = [searchGroup, ...actionGroups].filter(Boolean)

    return (
        <SplitButton
            onOpen={onOpen}
            onClose={onClose}
            visible={visible}
            primaryTestID={TEST_IDS.EDITOR_MODE_TOGGLE}
            triggerTestID={TEST_IDS.EDITOR_MENU}
            icon={read ? EditNote : Book}
            label={t(read ? 'button.edit' : 'button.preview')}
            onPress={onPrimaryPress}
        >
            {groups.map((group, index) => (
                <MenuGroup
                    key={index}
                    first={index === 0}
                    last={index === groups.length - 1}
                >
                    {group}
                </MenuGroup>
            ))}
        </SplitButton>
    )
}
