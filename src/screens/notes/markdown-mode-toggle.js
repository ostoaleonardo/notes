import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MenuItem, SplitButton } from '@/components'
import { useNoteActionsMenu } from './use-note-actions-menu'
import { Book, Code, Delete, EditNote, NoteStack, Shapes } from '@/icons'
import { useIconProps } from '@/hooks'

export const MarkdownModeToggle = ({
    mode,
    onSetMode,
    scope,
    onOpenTemplates,
    onOpenPlaceholders,
    onOpenRecents,
    onDelete
}) => {
    const { t } = useTranslation()
    const iconProps = useIconProps()
    const read = mode === 'read'

    const [menuVisible, setMenuVisible] = useState(false)
    const closeMenu = () => setMenuVisible(false)

    const noteActionsMenu = useNoteActionsMenu({
        onClose: closeMenu,
        onSetMode,
        onOpenTemplates,
        onOpenRecents
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
                        leadingIcon={() => <Code {...iconProps} />}
                        onPress={runAndClose(() => onSetMode('code'))}
                    />
                    <MenuItem
                        title={t('templates.view_placeholders')}
                        leadingIcon={() => <Shapes {...iconProps} />}
                        onPress={runAndClose(onOpenPlaceholders)}
                    />
                    <MenuItem
                        title={t('search.recent')}
                        leadingIcon={() => <NoteStack {...iconProps} />}
                        onPress={runAndClose(onOpenRecents)}
                    />
                    <MenuItem
                        title={t('button.delete')}
                        leadingIcon={() => <Delete {...iconProps} />}
                        onPress={runAndClose(onDelete)}
                    />
                </>
            ) : noteActionsMenu}
        </SplitButton>
    )
}
