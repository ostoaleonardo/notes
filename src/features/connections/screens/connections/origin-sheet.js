import { memo, useCallback, useMemo, useState } from 'react'
import { Keyboard, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { OriginTiles } from './origin-tiles'
import { RelationList } from './relation-list'
import { FreshSheet } from '@/ui/modal/fresh-sheet'
import { SearchBar } from '@/shared/components/input/search-bar'
import { EmptyMessage } from '@/ui/modal/empty-message'

import { describeEntity } from '@/features/connections/utils/connection-caption'
import { listOriginOptions } from '@/shared/utils/connection-model'

import { SHEET } from '@/shared/constants/components'
import { CONNECTION_TYPES, ORIGIN_TYPES } from '@/shared/constants/connections'
import { SPACING } from '@/shared/constants/theme'

const OriginContent = ({
    model,
    getTitle,
    onSelect
}) => {
    const { t } = useTranslation()
    const [type, setType] = useState(CONNECTION_TYPES.NOTE)
    const [query, setQuery] = useState('')

    const options = useMemo(() => Object.fromEntries(
        ORIGIN_TYPES.map((value) => [value, listOriginOptions(value, model)])
    ), [model])

    const counts = useMemo(() => Object.fromEntries(
        ORIGIN_TYPES.map((value) => [value, options[value].length])
    ), [options])

    const items = useMemo(() => {
        const needle = query.trim().toLowerCase()

        return options[type].filter((entity) => getTitle(entity).toLowerCase().includes(needle))
    }, [options, type, query, getTitle])

    const getCaption = useCallback((entity) => describeEntity(entity, model, t), [model, t])

    return (
        <Pressable
            accessible={false}
            style={styles.container}
            onPress={Keyboard.dismiss}
        >
            <OriginTiles
                types={ORIGIN_TYPES}
                counts={counts}
                selected={type}
                onSelect={setType}
            />

            <View style={styles.search}>
                <SearchBar
                    value={query}
                    onChangeText={setQuery}
                    label={t('connections.origin.filter')}
                />
            </View>

            <RelationList
                entities={items}
                getTitle={getTitle}
                getCaption={getCaption}
                onSelect={onSelect}
                keyboardShouldPersistTaps='handled'
                ListEmptyComponent={(
                    <EmptyMessage style={styles.empty}>
                        {t('connections.origin.empty')}
                    </EmptyMessage>
                )}
            />
        </Pressable>
    )
}

export const OriginSheet = memo(({
    sheet,
    model,
    getTitle,
    onSelect
}) => {
    return (
        <FreshSheet
            sheet={sheet}
            snapPoints={SHEET.snapPoints.search}
        >
            <OriginContent
                model={model}
                getTitle={getTitle}
                onSelect={onSelect}
            />
        </FreshSheet>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: SPACING.xl,
        marginHorizontal: SPACING.lg
    },
    search: {
    },
    empty: {
        paddingVertical: SPACING.lg
    }
})
