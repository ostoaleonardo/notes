import { memo, useCallback } from 'react'
import { FlatList } from 'react-native-gesture-handler'

import { GroupedList, GroupSeparator } from '@/ui/grouped-list'
import { useTheme } from '@/ui/hooks/use-theme'
import { EntityRow } from './entity-row'

import { BOTTOM_GAP } from '@/constants/theme'

const keyOf = (entity) => `${entity.type}:${entity.id}`

export const RelationList = memo(({
    entities,
    getTitle,
    getCaption,
    onSelect,
    ...props
}) => {
    const { colors } = useTheme()

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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: BOTTOM_GAP }}
            ItemSeparatorComponent={GroupSeparator}
            {...props}
        />
    )
})
