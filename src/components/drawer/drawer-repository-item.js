import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { IconButton } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Typography } from '../typography'
import { MenuContainer } from '../menu/menu-container'
import { MenuItem } from '../menu/menu-item'
import { useIconProps } from '@/hooks'
import { Delete, Edit, Folder, MoreVert } from '@/icons'

export function DrawerRepositoryItem({
    repository,
    count,
    active,
    onOpen,
    onAddSubfolder,
    onEditFolder,
    onDelete
}) {
    const { t } = useTranslation()
    const iconProps = useIconProps(16)
    const [menuVisible, setMenuVisible] = useState(false)

    const isRoot = repository.depth === 0

    const runAction = (action) => {
        setMenuVisible(false)
        action()
    }

    return (
        <View
            style={{
                ...styles.container,
                paddingLeft: 16 + repository.depth * 16
            }}
        >
            <Pressable
                onPress={onOpen}
                style={styles.content}
            >
                <Typography
                    bold={active}
                    uppercase
                >
                    {repository.alias}
                </Typography>
                <Typography
                    variant='caption'
                    opacity={active ? 0.8 : 0.5}
                >
                    {count}
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
        paddingVertical: 12,
        gap: 4
    }
})
