import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { CollapsibleTreeSheet } from '@/shared/components/collapsible-tree-sheet'

import { useRepositories } from '@/shared/hooks/use-repositories'

import { markChildren } from '@/shared/utils/collapsible-tree'

import { TEST_IDS } from '@/shared/constants/test-ids'

export const MoveNoteSheet = memo(({
    sheet,
    repositoryId,
    onSelect
}) => {
    const { t } = useTranslation()
    const { activeRepositoryTree } = useRepositories()

    const items = useMemo(() => markChildren(activeRepositoryTree).map((folder) => ({
        key: folder.id,
        title: folder.alias,
        depth: folder.depth,
        hasChildren: folder.hasChildren,
        disabled: folder.id === repositoryId,
        emphasized: folder.id === repositoryId
    })), [activeRepositoryTree, repositoryId])

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
