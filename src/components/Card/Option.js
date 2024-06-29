import { Pressable, StyleSheet } from 'react-native'
import { Typography } from '../Text'

export function Option({ rightLabel, rightContent, onPress, children }) {
    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
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
