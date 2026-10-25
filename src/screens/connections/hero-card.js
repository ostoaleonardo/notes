import { memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { ProgressRing } from '@/components/progress-ring'
import { Typography } from '@/components/typography'

import { SUMMARY_CARD } from '@/constants/connections'
import { RADIUS, SPACING } from '@/constants/theme'

export const HeroCard = memo(function HeroCard({
    progress,
    value,
    valueSize = SUMMARY_CARD.heroTextSize,
    title,
    testID,
    accessibilityLabel,
    onPress,
    children
}) {
    const { colors } = useTheme()

    return (
        <Pressable
            testID={testID}
            disabled={!onPress}
            accessibilityRole={onPress ? 'button' : undefined}
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            style={[styles.card, { backgroundColor: colors.surface }]}
        >
            <ProgressRing
                size={SUMMARY_CARD.heroRing}
                stroke={SUMMARY_CARD.heroStroke}
                progress={progress}
            >
                <Typography heading fontSize={valueSize}>
                    {value}
                </Typography>
            </ProgressRing>

            <View style={styles.text}>
                <Typography heading fontSize={SUMMARY_CARD.heroTitleSize}>
                    {title}
                </Typography>
                {children}
            </View>
        </Pressable>
    )
})

const styles = StyleSheet.create({
    card: {
        gap: SPACING.xl,
        padding: SPACING.xl,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.xl
    },
    text: {
        flex: 1,
        gap: SPACING.xs
    }
})
