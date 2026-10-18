import { DrawerFolderMenu } from './drawer-folder-menu'
import { DrawerTreeRow } from './drawer-tree-row'

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
    return (
        <DrawerTreeRow
            uppercase={true}
            label={alias}
            depth={depth}
            collapsed={isCollapsed}
            bold={isRoot && active}
            onPress={onPress}
            trailing={!isRoot && (
                <DrawerFolderMenu
                    actions={actions}
                    createLabelKey={createLabelKey}
                    onAction={onAction}
                />
            )}
        />
    )
}
