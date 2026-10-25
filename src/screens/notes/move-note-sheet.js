import { memo, useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { ListSheet } from '@/components/modal/list-sheet'
import { Typography } from '@/components/typography'

import { useRepositories } from '@/hooks/use-repositories'

import { Check } from '@/icons/check'
import { Folder } from '@/icons/folder'

import { MENU } from '@/constants/components'
import { OPACITY, SPACING, ICON_SIZE } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

const MoveNoteItem = memo(function MoveNoteItem({ item, current, onPress }) {
    const { colors } = useTheme()

    return (
        <Pressable
            disabled={current}
            accessibilityRole='button'
            onPress={() => onPress(item.id)}
            android_ripple={{ color: colors.onBackground + TRANSPARENT[10] }}
            style={[styles.item, { paddingLeft: SPACING.lg + item.depth * MENU.itemIndent }]}
        >
            <Folder
                width={ICON_SIZE.xxl}
                height={ICON_SIZE.xxl}
                color={colors.onBackground}
            />
            <View style={styles.title}>
                <Typography opacity={current ? OPACITY.muted : 1} numberOfLines={1}>
                    {item.alias}
                </Typography>
            </View>
            {current && (
                <Check
                    width={ICON_SIZE.xxl}
                    height={ICON_SIZE.xxl}
                    color={colors.onBackground}
                />
            )}
        </Pressable>
    )
})

export const MoveNoteSheet = memo(function MoveNoteSheet({ sheet, repositoryId, onSelect }) {
    const { t } = useTranslation()
    const { activeRepositoryTree } = useRepositories()

    const renderItem = useCallback(({ item }) => (
        <MoveNoteItem
            item={item}
            current={item.id === repositoryId}
            onPress={onSelect}
        />
    ), [repositoryId, onSelect])

    return (
        <ListSheet
            sheet={sheet}
            title={t('button.move')}
            data={activeRepositoryTree}
            renderItem={renderItem}
            keyExtractor={getFolderKey}
        />
    )
})

const getFolderKey = (item) => item.id

const styles = StyleSheet.create({
    item: {
        gap: SPACING.md,
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: SPACING.sm,
        paddingRight: SPACING.lg
    },
    title: {
        flex: 1
    }
})
