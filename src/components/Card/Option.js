import { Pressable, StyleSheet } from 'react-native'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

export function Option({ rightLabel, rightContent, onPress, children }) {
    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
            android_ripple={{ color: COLORS.white5 }}
        >
            {children}
            {rightContent || (
                <Typography>
                    {rightLabel}
                </Typography>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
})
