import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Typography } from '../typography'
import { MenuContainer } from '../menu/menu-container'
import { DrawerIconButton } from './drawer-icon-button'
import { DrawerRepositoryMenu } from './drawer-repository-menu'

import { useMenuAction } from '@/hooks/use-menu-action'

import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/icons/keyboard-arrow-up'
import { MoreVert } from '@/icons/more-vert'

export function DrawerRepositoryRow({
    alias,
    isRoot,
    active,
    isCollapsed,
    depth,
    onPress,
    onAction
}) {
    const { t } = useTranslation()
    const { visible, onOpen, onClose, trigger } = useMenuAction()

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
                visible={visible}
                onClose={onClose}
                anchor={
                    <DrawerIconButton
                        onPress={onOpen}
                        icon={MoreVert}
                        accessibilityLabel={t('button.more')}
                    />
                }
            >
                <DrawerRepositoryMenu
                    isRoot={isRoot}
                    onCreateNote={() => trigger(() => onAction('createNote'))}
                    onAddSubfolder={() => trigger(() => onAction('addSubfolder'))}
                    onEditFolder={() => trigger(() => onAction('editFolder'))}
                    onDelete={() => trigger(() => onAction('delete'))}
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
