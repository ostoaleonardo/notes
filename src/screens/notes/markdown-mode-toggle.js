import { useTranslation } from 'react-i18next'

import { useNoteActionsMenu } from './use-note-actions-menu'
import { useTemplateActionsMenu } from './use-template-actions-menu'
import { MenuItem } from '@/components/menu/menu-item'
import { MenuGroup } from '@/components/menu/menu-group'
import { SplitButton } from '@/components/button/split-button'

import { useMenuAction } from '@/hooks/use-menu-action'

import { Book } from '@/icons/book'
import { Edit } from '@/icons/edit'
import { EditNote } from '@/icons/edit-note'
import { Search } from '@/icons/search'

export const MarkdownModeToggle = ({
    mode,
    onSetMode,
    scope,
    isFocused,
    search,
    onOpenPlaceholders,
    onOpenVersionHistory,
    onOpenExportDialog,
    onOpenShareDialog,
    onOpenDeleteDialog,
    showBacklinks,
    onToggleShowBacklinks
}) => {
    const { t } = useTranslation()
    const read = mode === 'read'

    const { visible, onOpen, onClose, trigger } = useMenuAction()

    const noteActionsGroups = useNoteActionsMenu({
        onTrigger: trigger,
        onSetMode,
        onOpenVersionHistory,
        onOpenExportDialog,
        onOpenShareDialog,
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

    const actionGroups = scope === 'template' ? templateActionsGroups : noteActionsGroups

    const searchGroup = !isFocused && [
        <MenuItem
            key='find'
            title={t('button.find')}
            leadingIcon={(props) => <Search {...props} />}
            onPress={() => trigger(search.onOpenSearch)}
        />,
        mode !== 'read' && (
            <MenuItem
                key='replace'
                title={t('button.replace')}
                leadingIcon={(props) => <Edit {...props} />}
                onPress={() => trigger(search.onOpenReplace)}
            />
        )
    ].filter(Boolean)

    const groups = [searchGroup, ...actionGroups].filter(Boolean)

    return (
        <SplitButton
            onOpen={onOpen}
            onClose={onClose}
            visible={visible}
            icon={read ? EditNote : Book}
            label={t(read ? 'button.edit' : 'button.preview')}
            onPress={() => onSetMode(read ? 'live' : 'read')}
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
