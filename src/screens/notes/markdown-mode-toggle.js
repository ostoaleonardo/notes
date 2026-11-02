import { useCallback } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { NoteDetailsSheet } from './note-details-sheet'
import { useNoteActionsMenu } from './use-note-actions-menu'
import { useTemplateActionsMenu } from './use-template-actions-menu'
import { ActionMenuItem } from '@/ui/menu/action-menu-item'
import { MenuGroup } from '@/ui/menu/menu-group'
import { SplitButton } from '@/ui/button/split-button'

import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useMenuAction } from '@/hooks/use-menu-action'

import { Book } from '@/icons/book'
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
    onOpenMove,
    onOpenSharingDialog,
    onOpenDeleteDialog,
    showBacklinks,
    onToggleShowBacklinks
}) => {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const read = mode === EDITOR_MODES.READ

    const { visible, onOpen, onClose, trigger } = useMenuAction()
    const detailsSheet = useBottomSheet()

    const noteActionsGroups = useNoteActionsMenu({
        onTrigger: trigger,
        onSetMode,
        onOpenVersionHistory,
        onOpenDetails: detailsSheet.onOpen,
        onOpenMove,
        onOpenSharingDialog,
        onOpenDeleteDialog
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
        />
    ]

    const onPrimaryPress = useCallback(
        () => onSetMode(read ? EDITOR_MODES.LIVE : EDITOR_MODES.READ),
        [onSetMode, read]
    )

    const groups = [searchGroup, ...actionGroups].filter(Boolean)

    return (
        <>
            <SplitButton
                onOpen={onOpen}
                onClose={onClose}
                visible={visible}
                primaryTestID={TEST_IDS.EDITOR_MODE_TOGGLE}
                triggerTestID={TEST_IDS.EDITOR_MENU}
                icon={read ? EditNote : Book}
                label={t(read ? 'button.edit' : 'button.preview')}
                triggerLabel={t('button.more')}
                onPress={onPrimaryPress}
            >
                {groups.map((group, index) => (
                    <MenuGroup key={index}>
                        {group}
                    </MenuGroup>
                ))}
            </SplitButton>

            {scope !== TEMPLATE_SCOPE && (
                <NoteDetailsSheet
                    sheet={detailsSheet}
                    hasSlug={!!slug}
                    showBacklinks={showBacklinks}
                    onOpenOutline={onOpenOutline}
                    onOpenOutgoingLinks={onOpenOutgoingLinks}
                    onOpenVersionHistory={onOpenVersionHistory}
                    onToggleShowBacklinks={onToggleShowBacklinks}
                />
            )}
        </>
    )
}
