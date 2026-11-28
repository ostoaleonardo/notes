import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CollapsibleTreeSheet } from '@/features/editor/native/screens/notes/collapsible-tree-sheet'
import { useBottomSheet } from '@/shared/hooks/use-bottom-sheet'

import { buildOutline, findHeadings } from '@/shared/utils/headings'

export const OutlineSheet = memo(({
    contentRef,
    onSelect,
    onClose
}) => {
    const { t } = useTranslation()
    const sheet = useBottomSheet()

    const [outline] = useState(() => buildOutline(findHeadings(contentRef.current.content || '')))

    const items = useMemo(() => outline.map((heading) => ({
        key: heading.index,
        title: heading.text,
        depth: heading.depth,
        hasChildren: heading.hasChildren
    })), [outline])

    const onPress = useCallback((index) => {
        sheet.onClose()
        onSelect(index)
    }, [sheet, onSelect])

    return (
        <CollapsibleTreeSheet
            presentOnMount
            sheet={sheet}
            items={items}
            onClose={onClose}
            onSelect={onPress}
            title={t('title.outline')}
            emptyMessage={t('message.outline.empty')}
        />
    )
})
