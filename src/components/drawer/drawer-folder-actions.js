import { MenuContainer } from '@/components/menu/menu-container'
import { DrawerRepositoryMenu } from './drawer-repository-menu'

import { REPOSITORY_ACTIONS } from '@/constants/repository-actions'

const ALL_ACTIONS = Object.values(REPOSITORY_ACTIONS)

export function DrawerFolderActions({ menu, onAction }) {
    return (
        <MenuContainer
            visible={menu.visible}
            onClose={menu.onClose}
            anchor={menu.anchor}
        >
            <DrawerRepositoryMenu
                actions={ALL_ACTIONS}
                onAction={(action) => menu.trigger(() => onAction(action))}
            />
        </MenuContainer>
    )
}
