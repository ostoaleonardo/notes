import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ListItem } from '@/ui/list-item'
import { ListSheet } from '@/ui/modal/list-sheet'
import { useTheme } from '@/ui/hooks/use-theme'

import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useNotes } from '@/hooks/use-notes'
import { getEditorPath } from '@/utils/editor-path'
import { findOutgoingLinks } from '@/utils/outgoing-links'
import { pushOnce } from '@/utils/navigation'

import { ArrowForward } from '@/icons/arrow-forward'

const OutgoingLinkItem = memo(({ item, onPress }) => {
    const { colors } = useTheme()
    const resolved = !!item.path
    const handlePress = useCallback(() => onPress(item.path), [onPress, item.path])

    return (
        <ListItem
            uppercase={false}
            title={item.title}
            background={colors.surfaceVariant}
            onPress={resolved ? handlePress : undefined}
            rightContent={resolved ? <ArrowForward color={colors.onBackground} /> : undefined}
        />
    )
})

export const OutgoingLinksSheet = memo(({
    contentRef,
    selfPath,
    onClose
}) => {
    const { t } = useTranslation()
    const { notes, notePaths } = useNotes()
    const sheet = useBottomSheet()

    const [links] = useState(() => (
        findOutgoingLinks(contentRef.current.content, selfPath, notes, notePaths)
    ))

    const onPress = useCallback((path) => {
        sheet.onClose()
        pushOnce(getEditorPath(path))
    }, [sheet])

    const renderItem = useCallback(({ item }) => (
        <OutgoingLinkItem
            item={item}
            onPress={onPress}
        />
    ), [onPress])

    return (
        <ListSheet
            sheet={sheet}
            presentOnMount
            onClose={onClose}
            title={t('title.outgoing_links')}
            data={links}
            renderItem={renderItem}
            keyExtractor={getLinkKey}
            emptyMessage={t('message.outgoing_links.empty')}
        />
    )
})

const getLinkKey = (item) => item.key
