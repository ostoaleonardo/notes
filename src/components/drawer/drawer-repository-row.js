import { useTranslation } from 'react-i18next'

import { MenuContainer } from '../menu/menu-container'
import { DrawerIconButton } from './drawer-icon-button'
import { DrawerRepositoryMenu } from './drawer-repository-menu'
import { DrawerTreeRow } from './drawer-tree-row'

import { useMenuAction } from '@/hooks/use-menu-action'

import { MoreVert } from '@/icons/more-vert'

import { REPOSITORY_ACTIONS } from '@/constants/repository-actions'

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
        <DrawerTreeRow
            uppercase={true}
            label={alias}
            depth={depth}
            collapsed={isCollapsed}
            bold={isRoot && active}
            onPress={onPress}
            trailing={!isRoot && (
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
        />
    )
}
