import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Typography } from '@/components'

export function Option({ title, description, rightContent, onPress }) {
    const { colors } = useTheme()
    const { onBackground } = colors

    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
            android_ripple={{ color: onBackground + '1a' }}
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
        gap: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    left: {
        flex: 1,
        gap: 4
    }
})
