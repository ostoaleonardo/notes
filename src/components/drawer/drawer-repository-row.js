import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Typography } from '../typography'
import { MenuContainer } from '../menu/menu-container'
import { DrawerIconButton } from './drawer-icon-button'
import { DrawerRepositoryMenu } from './drawer-repository-menu'
import { KeyboardArrowDown, KeyboardArrowUp, MoreVert } from '@/icons'

export function DrawerRepositoryRow({
    alias,
    isRoot,
    active,
    isCollapsed,
    depth,
    onPress,
    onCreateNote,
    onAddSubfolder,
    onEditFolder,
    onDelete
}) {
    const { t } = useTranslation()
    const [menuVisible, setMenuVisible] = useState(false)

    const runAction = (action) => {
        setMenuVisible(false)
        action()
    }

    return (
        <View
            style={{
                ...styles.container,
                paddingLeft: depth * 16
            }}
        >
            <Pressable
                onPress={onPress}
                style={styles.content}
            >
                <DrawerIconButton
                    pointerEvents='none'
                    importantForAccessibility='no'
                    icon={isCollapsed ? KeyboardArrowUp : KeyboardArrowDown}
                />
                <Typography
                    uppercase={true}
                    numberOfLines={1}
                    bold={isRoot && active}
                >
                    {alias}
                </Typography>
            </Pressable>

            <MenuContainer
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                anchor={
                    <DrawerIconButton
                        onPress={() => setMenuVisible(true)}
                        icon={MoreVert}
                        accessibilityLabel={t('button.more')}
                    />
                }
            >
                <DrawerRepositoryMenu
                    isRoot={isRoot}
                    onCreateNote={() => runAction(onCreateNote)}
                    onAddSubfolder={() => runAction(onAddSubfolder)}
                    onEditFolder={() => runAction(onEditFolder)}
                    onDelete={() => runAction(onDelete)}
                />
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
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
