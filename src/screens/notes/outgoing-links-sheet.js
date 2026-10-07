import { memo, useCallback, useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { ListSheet } from '@/components/modal/list-sheet'
import { Typography } from '@/components/typography'

import { useNotes } from '@/hooks/use-notes'
import { getEditorPath } from '@/utils/editor-path'
import { findOutgoingLinks } from '@/utils/outgoing-links'

import { SPACING, OPACITY } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

const OutgoingLinkItem = memo(function OutgoingLinkItem({ item, onPress }) {
    const { colors } = useTheme()
    const resolved = !!item.path

    return (
        <Pressable
            disabled={!resolved}
            accessibilityRole='button'
            onPress={() => onPress(item.path)}
            android_ripple={{ color: colors.onBackground + TRANSPARENT[10] }}
            style={styles.item}
        >
            <Typography opacity={resolved ? 1 : OPACITY.muted}>
                {item.title}
            </Typography>
        </Pressable>
    )
})

export const OutgoingLinksSheet = memo(function OutgoingLinksSheet({ sheet, contentRef, selfPath }) {
    const { t } = useTranslation()
    const { notes, notePaths } = useNotes()
    const [links, setLinks] = useState([])

    const onChange = useCallback((index) => {
        if (index < 0) return

        setLinks(findOutgoingLinks(contentRef.current.content, selfPath, notes, notePaths))
    }, [contentRef, selfPath, notes, notePaths])

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
            onChange={onChange}
            data={links}
            renderItem={renderItem}
            keyExtractor={getLinkKey}
            emptyMessage={t('message.outgoing_links.empty')}
        />
    )
})

const getLinkKey = (item) => item.key

const styles = StyleSheet.create({
    item: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg
    }
})
