import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'

import { RADIUS } from '@/constants/themes'

export function OptionLarge({ title, description, children, onPress, isFirst, isLast }) {
    const { colors } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            style={{
                ...styles.container,
                backgroundColor: colors.surface,
                borderTopLeftRadius: isFirst ? RADIUS.outer : 0,
                borderTopRightRadius: isFirst ? RADIUS.outer : 0,
                borderBottomLeftRadius: isLast ? RADIUS.outer : 0,
                borderBottomRightRadius: isLast ? RADIUS.outer : 0
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
