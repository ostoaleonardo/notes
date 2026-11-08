import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { InputChip } from '@/ui/input-chip'

import { groupChips, removeChip } from '@/utils/search-query'

import { Close } from '@/icons/close'

import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

const SearchChip = memo(({ chip, query, setQuery }) => {
    const onRemove = useCallback(() => setQuery(removeChip(query, chip)), [query, chip, setQuery])

    return (
        <View testID={TEST_IDS.SEARCH_CHIP_PREFIX + chip.label}>
            <InputChip
                selected={!chip.negate}
                trailingIcon={Close}
                onPress={onRemove}
            >
                {chip.negate ? `-${chip.label}` : chip.label}
            </InputChip>
        </View>
    )
})

export const SearchChips = ({ chips, query, setQuery }) => {
    if (chips.length === 0) return null

    return (
        <View style={styles.container}>
            {groupChips(chips).map((group) => (
                <View
                    key={group[0].group}
                    style={styles.row}
                >
                    {group.map((chip) => (
                        <SearchChip
                            key={chip.key}
                            chip={chip}
                            query={query}
                            setQuery={setQuery}
                        />
                    ))}
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: SPACING.xxs,
        paddingHorizontal: SPACING.lg
    },
    row: {
        flexWrap: 'wrap',
        gap: SPACING.xxs,
        flexDirection: 'row'
    }
})
