import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { IconButton } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Typography } from '../typography'
import { MenuContainer } from '../menu/menu-container'
import { MenuItem } from '../menu/menu-item'
import { DrawerNoteItem } from './drawer-note-item'
import { useIconProps, useUtils } from '@/hooks'
import { Delete, Edit, Folder, KeyboardArrowDown, KeyboardArrowUp, MoreVert, Plus } from '@/icons'

export function DrawerRepositoryItem({
    repository,
    depth,
    active,
    activeNoteId,
    subfolders,
    notes,
    onOpenRoot,
    onOpenNote,
    onAddSubfolder,
    onCreateNote,
    onEditFolder,
    onDelete
}) {
    const { t } = useTranslation()
    const { collapsedFolders, toggleFolder } = useUtils()
    const [menuVisible, setMenuVisible] = useState(false)

    const iconProps = useIconProps(16)
    const chevronIconProps = useIconProps(16, 0.6)

    const isRoot = depth === 0
    const isCollapsed = collapsedFolders.has(repository.id)

    const runAction = (action) => {
        setMenuVisible(false)
        action()
    }

    const onPress = () => {
        if (isRoot) onOpenRoot(repository.id)
        toggleFolder(repository.id)
    }

    return (
        <View>
            <View
                style={{
                    ...styles.container,
                    paddingLeft: 8 + depth * 16
                }}
            >
                <Pressable
                    onPress={onPress}
                    style={styles.content}
                >
                    {isCollapsed
                        ? <KeyboardArrowUp {...chevronIconProps} />
                        : <KeyboardArrowDown {...chevronIconProps} />}
                    <Typography
                        bold={isRoot && active}
                        uppercase
                        numberOfLines={1}
                    >
                        {repository.alias}
                    </Typography>
                </Pressable>

                <MenuContainer
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    anchor={
                        <IconButton
                            onPress={() => setMenuVisible(true)}
                            icon={() => <MoreVert {...iconProps} />}
                            accessibilityLabel={t('button.more')}
                        />
                    }
                >
                    <MenuItem
                        title={t('repositories.create_note')}
                        leadingIcon={() => <Plus {...iconProps} />}
                        onPress={() => runAction(() => onCreateNote(repository.id))}
                    />
                    <MenuItem
                        title={t('repositories.add_subfolder')}
                        leadingIcon={() => <Folder {...iconProps} />}
                        onPress={() => runAction(onAddSubfolder)}
                    />
                    {!isRoot && (
                        <MenuItem
                            title={t('repositories.edit_folder')}
                            leadingIcon={() => <Edit {...iconProps} />}
                            onPress={() => runAction(onEditFolder)}
                        />
                    )}
                    {!isRoot && (
                        <MenuItem
                            title={t('repositories.delete_folder')}
                            leadingIcon={() => <Delete {...iconProps} />}
                            onPress={() => runAction(onDelete)}
                        />
                    )}
                </MenuContainer>
            </View>

            {!isCollapsed && (
                <>
                    {notes.map((note) => (
                        <DrawerNoteItem
                            key={note.id}
                            note={note}
                            depth={depth + 1}
                            active={note.id === activeNoteId}
                            onPress={() => onOpenNote(note.id)}
                        />
                    ))}

                    {subfolders.map((subfolder) => (
                        <DrawerRepositoryItem
                            key={subfolder.repository.id}
                            {...subfolder}
                            depth={depth + 1}
                            active={active}
                            activeNoteId={activeNoteId}
                            onOpenRoot={onOpenRoot}
                            onOpenNote={onOpenNote}
                            onAddSubfolder={() => onAddSubfolder(subfolder.repository.id)}
                            onCreateNote={onCreateNote}
                            onEditFolder={() => onEditFolder(subfolder.repository.id)}
                            onDelete={() => onDelete(subfolder.repository.id)}
                        />
                    ))}
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    content: {
        flex: 1,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6
    }
})
