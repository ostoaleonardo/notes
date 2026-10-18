import { memo, useCallback } from 'react'
import { View } from 'react-native'

import { DrawerFolderActions } from './drawer-folder-actions'
import { DrawerTreeRow } from './drawer-tree-row'

import { useMenuAnchor } from '@/hooks/use-menu-anchor'
import { useUtils } from '@/hooks/use-utils'

import { TEMPLATE_FOLDER_ACTIONS } from '@/constants/repository-actions'

export const DrawerTemplateFolderItem = memo(function DrawerTemplateFolderItem({
    folder,
    onAction
}) {
    const { toggleFolder } = useUtils()
    const menu = useMenuAnchor()

    const onPress = useCallback(() => toggleFolder(folder.id), [toggleFolder, folder.id])

    const handleAction = useCallback((action) => {
        onAction(action, folder.path)
    }, [onAction, folder.path])

    return (
        <View ref={menu.rowRef} collapsable={false}>
            <DrawerTreeRow
                uppercase
                label={folder.name}
                depth={folder.depth}
                collapsed={folder.isCollapsed}
                onPress={onPress}
                onLongPress={menu.onPressRow}
            />
            <DrawerFolderActions
                menu={menu}
                actions={TEMPLATE_FOLDER_ACTIONS}
                createLabelKey='templates.new'
                onAction={handleAction}
            />
        </View>
    )
})
