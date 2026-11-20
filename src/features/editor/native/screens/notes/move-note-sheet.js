import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { CollapsibleTreeSheet } from '@/shared/components/collapsible-tree-sheet'

import { useFolders } from '@/shared/hooks/use-folders'

import { markChildren } from '@/shared/utils/collapsible-tree'

import { TEST_IDS } from '@/shared/constants/test-ids'

export const MoveNoteSheet = memo(({
    sheet,
    folderId,
    onSelect
}) => {
    const { t } = useTranslation()
    const { activeFolderTree } = useFolders()

    const items = useMemo(() => markChildren(activeFolderTree).map((folder) => ({
        key: folder.id,
        title: folder.alias,
        depth: folder.depth,
        hasChildren: folder.hasChildren,
        disabled: folder.id === folderId,
        emphasized: folder.id === folderId
    })), [activeFolderTree, folderId])

    return (
        <CollapsibleTreeSheet
            sheet={sheet}
            items={items}
            onSelect={onSelect}
            title={t('button.move')}
            itemTestID={TEST_IDS.MOVE_TARGET}
        />
    )
})
