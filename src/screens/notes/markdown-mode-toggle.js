import { useTranslation } from 'react-i18next'

import { useNoteActionsMenu } from './use-note-actions-menu'
import { MenuItem } from '@/components/menu/menu-item'
import { SplitButton } from '@/components/button/split-button'

import { useMenuAction } from '@/hooks/use-menu-action'

import { Book } from '@/icons/book'
import { Code } from '@/icons/code'
import { Commit } from '@/icons/commit'
import { Delete } from '@/icons/delete'
import { EditNote } from '@/icons/edit-note'
import { Shapes } from '@/icons/shapes'

export const MarkdownModeToggle = ({
    mode,
    onSetMode,
    scope,
    onOpenPlaceholders,
    onOpenVersionHistory,
    onDelete
}) => {
    const { t } = useTranslation()
    const read = mode === 'read'

    const { visible, onOpen, onClose, trigger } = useMenuAction()

    const noteActionsMenu = useNoteActionsMenu({
        onTrigger: trigger,
        onSetMode,
        onOpenVersionHistory
    })

    return (
        <SplitButton
            icon={read ? EditNote : Book}
            label={t(read ? 'button.edit' : 'button.preview')}
            onPress={() => onSetMode(read ? 'live' : 'read')}
            visible={visible}
            onOpen={onOpen}
            onClose={onClose}
        >
            {scope === 'template' ? (
                <>
                    <MenuItem
                        title={t('button.code')}
                        leadingIcon={(props) => <Code {...props} />}
                        onPress={() => trigger(() => onSetMode('code'))}
                    />
                    <MenuItem
                        title={t('templates.view_placeholders')}
                        leadingIcon={(props) => <Shapes {...props} />}
                        onPress={() => trigger(onOpenPlaceholders)}
                    />
                    <MenuItem
                        title={t('title.version_history')}
                        leadingIcon={(props) => <Commit {...props} />}
                        onPress={() => trigger(onOpenVersionHistory)}
                    />
                    <MenuItem
                        title={t('button.delete')}
                        leadingIcon={(props) => <Delete {...props} />}
                        onPress={() => trigger(onDelete)}
                    />
                </>
            ) : noteActionsMenu}
        </SplitButton>
    )
}
