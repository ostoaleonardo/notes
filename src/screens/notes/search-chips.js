import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { SearchChipGroup } from './search-chip-group'
import { SearchChipsSummary } from './search-chips-summary'
import { useTheme } from '@/ui/hooks/use-theme'

import { groupChips } from '@/utils/search-query'

import { RADIUS, SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

export const SearchChips = ({ chips, query, setQuery }) => {
    const { colors } = useTheme()
    const [expanded, setExpanded] = useState(false)

    const onToggle = useCallback(() => setExpanded((open) => !open), [])

    if (chips.length === 0) return null

    return (
        <View
            style={[
                styles.container, {
                    backgroundColor: colors.surfaceVariant
                }
            ]}
        >
            <SearchChipsSummary
                chips={chips}
                expanded={expanded}
                onPress={onToggle}
            />

            {expanded && (
                <View
                    testID={TEST_IDS.SEARCH_CHIPS}
                    style={styles.groups}
                >
                    {groupChips(chips).map((group) => (
                        <SearchChipGroup
                            key={group[0].group}
                            group={group}
                            query={query}
                            setQuery={setQuery}
                        />
                    ))}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: SPACING.md,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginHorizontal: SPACING.lg
    },
    groups: {
        gap: SPACING.xxxs
    }
})
