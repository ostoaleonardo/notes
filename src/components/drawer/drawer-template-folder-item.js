import { memo, useCallback } from 'react'
import { View } from 'react-native'

import { DrawerFolderActions } from './drawer-folder-actions'
import { DrawerTreeRow } from './drawer-tree-row'

import { useMenuAction } from '@/hooks/use-menu-action'
import { useUtils } from '@/hooks/use-utils'

import { TEMPLATE_FOLDER_ACTIONS } from '@/constants/repository-actions'

export const DrawerTemplateFolderItem = memo(function DrawerTemplateFolderItem({
    folder,
    onAction
}) {
    const { toggleFolder } = useUtils()
    const menu = useMenuAction()

    const onPress = useCallback(() => toggleFolder(folder.id), [toggleFolder, folder.id])

    const handleAction = useCallback((action) => {
        onAction(action, folder.path)
    }, [onAction, folder.path])

    return (
        <View>
            <DrawerTreeRow
                uppercase
                label={folder.name}
                depth={folder.depth}
                collapsed={folder.isCollapsed}
                onPress={onPress}
                onLongPress={menu.onOpen}
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
