import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'

import { getGroupedRadius } from '@/utils/grouped-card-style'
import { SPACING } from '@/constants/spacing'

export function Option({ title, description, rightContent, onPress, visible = true, isFirst, isLast }) {
    const { colors } = useTheme()

    if (!visible) return null

    return (
        <Pressable
            accessibilityRole='button'
            onPress={onPress}
            style={{
                ...styles.container,
                backgroundColor: colors.surface,
                ...getGroupedRadius(isFirst, isLast)
            }}
        >
            <View style={styles.left}>
                <Typography
                    uppercase
                >
                    {title}
                </Typography>
                {description && (
                    <Typography
                        opacity={0.5}
                        variant='caption'
                    >
                        {description}
                    </Typography>
                )}
            </View>
            {rightContent}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: SPACING.lg,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    left: {
        flex: 1,
        gap: SPACING.xxs
    }
})
