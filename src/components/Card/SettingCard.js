import { Pressable, StyleSheet } from 'react-native'
import { Typography } from '../Text'
import { colors } from '@/constants'

export function SettingCard({ rightLabel, onPress, children }) {
    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
        >
            {children}
            <Typography>
                {rightLabel}
            </Typography>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        paddingVertical: 32,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.foreground,
    },
})
