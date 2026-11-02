import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ListItem } from '@/ui/list-item'
import { ListSheet } from '@/ui/modal/list-sheet'
import { useTheme } from '@/ui/hooks/use-theme'

import { useNotes } from '@/hooks/use-notes'
import { getEditorPath } from '@/utils/editor-path'
import { findOutgoingLinks } from '@/utils/outgoing-links'
import { pushOnce } from '@/utils/navigation'

import { ArrowForward } from '@/icons/arrow-forward'

const OutgoingLinkItem = memo(function OutgoingLinkItem({ item, onPress }) {
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

export const OutgoingLinksSheet = memo(function OutgoingLinksSheet({ sheet, contentRef, selfPath }) {
    const { t } = useTranslation()
    const { notes, notePaths } = useNotes()
    const [links, setLinks] = useState([])

    sheet.beforeOpen.current = () => {
        setLinks(findOutgoingLinks(contentRef.current.content, selfPath, notes, notePaths))
    }

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
            title={t('title.outgoing_links')}
            data={links}
            renderItem={renderItem}
            keyExtractor={getLinkKey}
            emptyMessage={t('message.outgoing_links.empty')}
        />
    )
})

const getLinkKey = (item) => item.key
