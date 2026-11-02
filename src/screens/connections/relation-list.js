import { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

import { GroupedList, GroupSeparator } from '@/ui/grouped-list'
import { useSheetBottomSpacing } from '@/ui/hooks/use-sheet-bottom-spacing'
import { useTheme } from '@/ui/hooks/use-theme'
import { EntityRow } from './entity-row'

import { SPACING } from '@/constants/theme'

const keyOf = (entity) => `${entity.type}:${entity.id}`

export const RelationList = memo(function RelationList({
    entities,
    getTitle,
    getCaption,
    onSelect,
    ...props
}) {
    const { colors } = useTheme()
    const bottom = useSheetBottomSpacing()

    const renderItem = useCallback(({ item }) => (
        <EntityRow
            entity={item}
            title={getTitle(item)}
            caption={getCaption?.(item)}
            background={colors.surfaceVariant}
            onPress={onSelect}
        />
    ), [colors, getTitle, getCaption, onSelect])

    return (
        <GroupedList
            paged
            component={FlatList}
            data={entities}
            renderItem={renderItem}
            keyExtractor={keyOf}
            contentContainerStyle={[styles.list, { paddingBottom: bottom }]}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={GroupSeparator}
            {...props}
        />
    )
})

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: SPACING.lg
    }
})
