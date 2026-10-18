import { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { OriginTiles } from './origin-tiles'
import { RelationList } from './relation-list'
import { FreshSheet } from '@/components/modal/fresh-sheet'
import { SmallInput } from '@/components/input/small-input'
import { Typography } from '@/components/typography'

import { describeEntity } from '@/utils/connection-caption'
import { listOriginOptions } from '@/utils/connection-model'

import { SEARCH_INPUT, SHEET } from '@/constants/components'
import { CONNECTION_TYPES, ORIGIN_TYPES } from '@/constants/connections'
import { OPACITY, SPACING } from '@/constants/theme'

function OriginContent({ model, getTitle, onSelect }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
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
        <View style={styles.container}>
            <OriginTiles
                types={ORIGIN_TYPES}
                counts={counts}
                selected={type}
                onSelect={setType}
            />

            <View style={styles.search}>
                <SmallInput
                    background={colors.surfaceVariant}
                    value={query}
                    onChangeText={setQuery}
                    placeholder={t('connections.origin.filter')}
                />
            </View>

            <RelationList
                entities={items}
                getTitle={getTitle}
                getCaption={getCaption}
                onSelect={onSelect}
                keyboardShouldPersistTaps='always'
                ListEmptyComponent={(
                    <Typography opacity={OPACITY.muted} styleProps={styles.empty}>
                        {t('connections.origin.empty')}
                    </Typography>
                )}
            />
        </View>
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
    search: {
        flexDirection: 'row',
        height: SEARCH_INPUT.actionSize,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md
    },
    empty: {
        paddingHorizontal: SPACING.sm
    }
})
