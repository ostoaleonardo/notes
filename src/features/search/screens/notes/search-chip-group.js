import { StyleSheet, View } from 'react-native'

import { SearchChip } from './search-chip'
import { GROUP_ICONS } from './search-filter-icons'
import { useTheme } from '@/ui/hooks/use-theme'

import { RADIUS, SIZE, SPACING, ICON_SIZE } from '@/constants/theme'

export const SearchChipGroup = ({ group, query, setQuery }) => {
    const { colors } = useTheme()

    const Icon = GROUP_ICONS[group[0].group]

    return (
        <View style={styles.row}>
            {!!Icon && (
                <View
                    style={[
                        styles.icon, {
                            backgroundColor: colors.background
                        }
                    ]}
                >
                    <Icon
                        width={ICON_SIZE.lg}
                        height={ICON_SIZE.lg}
                        color={colors.onSurfaceVariant}
                    />
                </View>
            )}

            <View style={styles.chips}>
                {group.map((chip) => (
                    <SearchChip
                        key={chip.key}
                        chip={chip}
                        query={query}
                        setQuery={setQuery}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        gap: SPACING.xs,
        alignItems: 'flex-start',
        flexDirection: 'row'
    },
    icon: {
        width: SIZE.xs,
        height: SIZE.xs,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xxxs,
        borderRadius: RADIUS.md
    },
    chips: {
        flex: 1,
        flexWrap: 'wrap',
        gap: SPACING.xxs,
        flexDirection: 'row'
    }
})
