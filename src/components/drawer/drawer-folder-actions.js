import { Menu } from '@/ui/menu/menu'
import { MenuGroup } from '@/ui/menu/menu-group'
import { DrawerRepositoryMenu } from './drawer-repository-menu'

import { REPOSITORY_ACTIONS } from '@/constants/repository-actions'

const ALL_ACTIONS = Object.values(REPOSITORY_ACTIONS)

export function DrawerFolderActions({
    menu,
    actions = ALL_ACTIONS,
    createLabelKey,
    onAction
}) {
    return (
        <Menu visible={menu.visible} onClose={menu.onClose}>
            <MenuGroup>
                <DrawerRepositoryMenu
                    actions={actions}
                    createLabelKey={createLabelKey}
                    onAction={(action) => menu.trigger(() => onAction(action))}
                />
            </MenuGroup>
        </Menu>
    )
}
