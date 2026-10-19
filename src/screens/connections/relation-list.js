import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useTheme } from 'react-native-paper'

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

    const renderItem = useCallback(({ item, index }) => (
        <EntityRow
            entity={item}
            title={getTitle(item)}
            caption={getCaption?.(item)}
            isFirst={index === 0}
            isLast={index === entities.length - 1}
            background={colors.surfaceVariant}
            onPress={onSelect}
        />
    ), [entities.length, colors, getTitle, getCaption, onSelect])

    return (
        <FlatList
            data={entities}
            renderItem={renderItem}
            keyExtractor={keyOf}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={Separator}
            {...props}
        />
    )
})

const Separator = () => <View style={styles.separator} />

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg
    },
    separator: {
        height: SPACING.xxxs
    }
})
