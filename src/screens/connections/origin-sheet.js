import { memo, useCallback, useMemo, useState } from 'react'
import { Keyboard, Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { OriginTiles } from './origin-tiles'
import { RelationList } from './relation-list'
import { FreshSheet } from '@/components/modal/fresh-sheet'
import { SearchInput } from '@/components/input/search-input'
import { Typography } from '@/components/typography'

import { describeEntity } from '@/utils/connection-caption'
import { listOriginOptions } from '@/utils/connection-model'

import { SHEET } from '@/constants/components'
import { CONNECTION_TYPES, ORIGIN_TYPES } from '@/constants/connections'
import { OPACITY, SPACING } from '@/constants/theme'

function OriginContent({ model, getTitle, onSelect }) {
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
        <Pressable accessible={false} style={styles.container} onPress={Keyboard.dismiss}>
            <OriginTiles
                types={ORIGIN_TYPES}
                counts={counts}
                selected={type}
                onSelect={setType}
            />

            <SearchInput
                value={query}
                onChangeText={setQuery}
                label={t('connections.origin.filter')}
            />

            <RelationList
                entities={items}
                getTitle={getTitle}
                getCaption={getCaption}
                onSelect={onSelect}
                keyboardShouldPersistTaps='handled'
                ListEmptyComponent={(
                    <Typography opacity={OPACITY.muted} styleProps={styles.empty}>
                        {t('connections.origin.empty')}
                    </Typography>
                )}
            />
        </Pressable>
    )
}

export const OriginSheet = memo(function OriginSheet({ sheet, model, getTitle, onSelect }) {
    return (
        <FreshSheet sheet={sheet} snapPoints={SHEET.snapPoints.search}>
            <OriginContent model={model} getTitle={getTitle} onSelect={onSelect} />
        </FreshSheet>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    empty: {
        paddingHorizontal: SPACING.sm
    }
})
