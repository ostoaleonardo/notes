import { memo } from 'react'

import { AnimatedView } from '@/components/animated/animated-view'
import { DrawerRepositoryRow } from './drawer-repository-row'

import { useUtils } from '@/hooks/use-utils'

import { TEMPLATE_FOLDER_ACTIONS } from '@/constants/repository-actions'

export const DrawerTemplateFolderItem = memo(function DrawerTemplateFolderItem({
    folder,
    onAction
}) {
    const { toggleFolder } = useUtils()

    return (
        <AnimatedView>
            <DrawerRepositoryRow
                alias={folder.name}
                isRoot={false}
                active={false}
                isCollapsed={folder.isCollapsed}
                depth={folder.depth}
                actions={TEMPLATE_FOLDER_ACTIONS}
                createLabelKey='templates.new'
                onPress={() => toggleFolder(folder.id)}
                onAction={(action) => onAction(action, folder.path)}
            />
        </AnimatedView>
    )
})
