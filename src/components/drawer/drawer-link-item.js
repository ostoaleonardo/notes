import { memo } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'

import { OPACITY, SPACING } from '@/constants/theme'

export const DrawerLinkItem = memo(function DrawerLinkItem({ row, onPress }) {
    return (
        <AnimatedView>
            <Pressable
                accessibilityRole='button'
                onPress={() => onPress(row)}
                style={styles.container}
            >
                <Typography numberOfLines={1}>
                    {row.title}
                </Typography>
                {!!row.caption && (
                    <Typography
                        variant='caption'
                        opacity={OPACITY.muted}
                        numberOfLines={1}
                    >
                        {row.caption}
                    </Typography>
                )}
            </Pressable>
        </AnimatedView>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.xs,
        paddingLeft: SPACING.sm,
        paddingRight: SPACING.lg
    }
})
