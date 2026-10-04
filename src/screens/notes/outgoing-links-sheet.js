import { memo, useCallback, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { ModalSheet } from '@/components/modal/modal-sheet'
import { Typography } from '@/components/typography'

import { useNotes } from '@/hooks/use-notes'
import { getEditorPath } from '@/utils/editor-path'
import { findOutgoingLinks } from '@/utils/outgoing-links'

import { SHEET_SNAP_POINTS } from '@/constants/sheet'
import { SPACING } from '@/constants/spacing'
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
            <Typography opacity={resolved ? 1 : 0.5}>
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
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            onChange={onChange}
            snapPoints={SHEET_SNAP_POINTS.TALL}
        >
            <FlatList
                data={links}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={renderItem}
                ListEmptyComponent={(
                    <View style={styles.empty}>
                        <Typography opacity={0.5}>
                            {t('message.outgoing_links.empty')}
                        </Typography>
                    </View>
                )}
            />
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    list: {
        paddingBottom: SPACING.lg
    },
    item: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg
    },
    empty: {
        paddingTop: 64,
        alignItems: 'center'
    }
})
