import { memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { AnimatedView } from '@/ui/animated/animated-view'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { RADIUS, SPACING, OPACITY } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

export const DrawerFileItem = memo(({ file, onOpenFile }) => {
    const { colors } = useTheme()

    return (
        <AnimatedView>
            <Pressable
                accessibilityRole='button'
                onPress={() => onOpenFile(file)}
                style={styles.container}
            >
                <View style={styles.text}>
                    <Typography numberOfLines={1}>
                        {file.name}
                    </Typography>
                    {!!file.folder && (
                        <Typography
                            variant='bodySmall'
                            opacity={OPACITY.muted}
                            numberOfLines={1}
                        >
                            {file.folder}
                        </Typography>
                    )}
                </View>
                <View
                    style={[
                        styles.badge,
                        { backgroundColor: colors.onBackground + TRANSPARENT[10] }
                    ]}
                >
                    <Typography
                        variant='bodySmall'
                        opacity={OPACITY.pressed}
                    >
                        {file.extension}
                    </Typography>
                </View>
            </Pressable>
        </AnimatedView>
    )
})

const styles = StyleSheet.create({
    container: {
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        paddingLeft: SPACING.sm
    },
    text: {
        flex: 1
    },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xxxs,
        borderRadius: RADIUS.sm
    }
})
