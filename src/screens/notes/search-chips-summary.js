import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

import { Typography } from '@/ui/typography'
import { KeyboardArrowDown } from '@/ui/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/ui/icons/keyboard-arrow-up'
import { useTheme } from '@/ui/hooks/use-theme'

import { ICON_SIZE, OPACITY, SIZE, SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

export const SearchChipsSummary = ({ chips, expanded, onPress }) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const Arrow = expanded ? KeyboardArrowUp : KeyboardArrowDown

    return (
        <Pressable
            accessibilityRole='button'
            accessibilityState={{ expanded }}
            testID={TEST_IDS.SEARCH_CHIPS_SUMMARY}
            style={styles.summary}
            onPress={onPress}
        >
            <Typography
                uppercase={true}
                variant='bodySmall'
                opacity={OPACITY.secondary}
                styleProps={styles.title}
            >
                {t('search.filters_count', { count: chips.length })}
            </Typography>

            <Arrow
                width={ICON_SIZE.lg}
                height={ICON_SIZE.lg}
                color={colors.onBackground}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    summary: {
        gap: SPACING.xs,
        alignItems: 'center',
        flexDirection: 'row'
    },
    icon: {
        width: SIZE.xs,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        flex: 1
    }
})
