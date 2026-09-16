import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'

import { getGroupedRadius } from '@/utils/grouped-card-style'

export function OptionLarge({ title, description, children, onPress, isFirst, isLast }) {
    const { colors } = useTheme()

    return (
        <Pressable
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
            {children}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        padding: 16,
        alignItems: 'flex-start'
    },
    left: {
        flex: 1,
        gap: 4
    }
})
