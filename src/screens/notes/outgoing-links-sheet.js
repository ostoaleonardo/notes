import { memo, useCallback, useState } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { ListItem } from '@/components/list-item'
import { ListSheet } from '@/components/modal/list-sheet'

import { useNotes } from '@/hooks/use-notes'
import { getEditorPath } from '@/utils/editor-path'
import { findOutgoingLinks } from '@/utils/outgoing-links'

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
        router.push(getEditorPath(path))
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
            data={links}
            renderItem={renderItem}
            keyExtractor={getLinkKey}
            emptyMessage={t('message.outgoing_links.empty')}
        />
    )
})

const getLinkKey = (item) => item.key
