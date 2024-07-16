import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Typography } from '../Text'

export function Option({ rightLabel, rightContent, onPress, children }) {
    const { colors } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
            android_ripple={{ color: colors.onBackground + '1a' }}
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
    }
})
