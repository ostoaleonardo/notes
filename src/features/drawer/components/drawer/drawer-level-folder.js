import { memo, useCallback } from 'react'
import { View } from 'react-native'

import { DrawerFolderActions } from './drawer-folder-actions'
import { TreeRow } from '@/ui/tree-row'

import { useMenuAction } from '@/shared/hooks/use-menu-action'

export const DrawerLevelFolder = memo(({
    folder,
    onEnter,
    onAction
}) => {
    const menu = useMenuAction()

    const onPress = useCallback(() => onEnter(folder.id), [onEnter, folder.id])

    const handleAction = useCallback((action) => {
        onAction(action, folder.id)
    }, [onAction, folder.id])

    return (
        <View>
            <TreeRow
                collapsed
                label={folder.alias}
                onPress={onPress}
                onLongPress={menu.onOpen}
            />
            <DrawerFolderActions menu={menu} onAction={handleAction} />
        </View>
    )
})
