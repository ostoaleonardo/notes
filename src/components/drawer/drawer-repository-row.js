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

import { BUTTON_SIZE } from '@/constants/button'
import { REPOSITORY_ACTIONS } from '@/constants/repository-actions'
import { SPACING } from '@/constants/spacing'

const ALL_ACTIONS = Object.values(REPOSITORY_ACTIONS)

export function DrawerRepositoryRow({
    alias,
    isRoot,
    active,
    isCollapsed,
    depth,
    actions = ALL_ACTIONS,
    createLabelKey,
    onPress,
    onAction
}) {
    const { t } = useTranslation()
    const { visible, onOpen, onClose, trigger } = useMenuAction()

    return (
        <View
            style={{
                ...styles.container,
                paddingLeft: depth * SPACING.lg
            }}
        >
            <Pressable
                onPress={onPress}
                style={styles.content}
            >
                <DrawerIconButton
                    style={styles.chevron}
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

            {!isRoot && (
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
                        actions={actions}
                        createLabelKey={createLabelKey}
                        onAction={(action) => trigger(() => onAction(action))}
                    />
                </MenuContainer>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: BUTTON_SIZE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    chevron: {
        margin: 0
    },
    content: {
        flex: 1,
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
