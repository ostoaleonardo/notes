import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { InputChip } from '@/ui/input-chip'

import { getChipText } from '@/utils/search-chip-label'
import { removeChip, toggleChipNegation } from '@/utils/search-query'

import { Close } from '@/icons/close'

import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

export const SearchChip = memo(({ chip, query, setQuery }) => {
    const { t } = useTranslation()

    const onToggle = useCallback(() => setQuery(toggleChipNegation(query, chip)), [query, chip, setQuery])
    const onRemove = useCallback(() => setQuery(removeChip(query, chip)), [query, chip, setQuery])

    return (
        <View
            testID={TEST_IDS.SEARCH_CHIP_PREFIX + chip.label}
            style={styles.chip}
        >
            <InputChip
                selected={!chip.negate}
                strikethrough={chip.negate}
                trailingIcon={Close}
                onPress={onToggle}
                onTrailingPress={onRemove}
            >
                {getChipText(chip, t)}
            </InputChip>
        </View>
    )
})

const styles = StyleSheet.create({
    chip: {
        marginVertical: -SPACING.xs
    }
})
