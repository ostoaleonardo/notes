import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useNoteActionsMenu } from './use-note-actions-menu'
import { MenuItem } from '@/components/menu/menu-item'
import { SplitButton } from '@/components/button/split-button'

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

    const [menuVisible, setMenuVisible] = useState(false)
    const closeMenu = () => setMenuVisible(false)

    const noteActionsMenu = useNoteActionsMenu({
        onClose: closeMenu,
        onSetMode,
        onOpenVersionHistory
    })

    const runAndClose = (action) => () => {
        closeMenu()
        action?.()
    }

    return (
        <SplitButton
            icon={read ? EditNote : Book}
            label={t(read ? 'button.edit' : 'button.preview')}
            onPress={() => onSetMode(read ? 'live' : 'read')}
            visible={menuVisible}
            onOpen={() => setMenuVisible(true)}
            onClose={closeMenu}
        >
            {scope === 'template' ? (
                <>
                    <MenuItem
                        title={t('button.code')}
                        leadingIcon={(props) => <Code {...props} />}
                        onPress={runAndClose(() => onSetMode('code'))}
                    />
                    <MenuItem
                        title={t('templates.view_placeholders')}
                        leadingIcon={(props) => <Shapes {...props} />}
                        onPress={runAndClose(onOpenPlaceholders)}
                    />
                    <MenuItem
                        title={t('title.version_history')}
                        leadingIcon={(props) => <Commit {...props} />}
                        onPress={runAndClose(onOpenVersionHistory)}
                    />
                    <MenuItem
                        title={t('button.delete')}
                        leadingIcon={(props) => <Delete {...props} />}
                        onPress={runAndClose(onDelete)}
                    />
                </>
            ) : noteActionsMenu}
        </SplitButton>
    )
}
