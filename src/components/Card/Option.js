import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Typography } from '../Text'

export function Option({ title, description, rightContent, onPress }) {
    const { colors } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
            android_ripple={{ color: colors.onBackground + '1a' }}
        >
            <View style={{ flex: 1, gap: 4 }}>
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
    }
})
