import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Typography } from '@/components'
import { COMMONS } from '@/constants'

export function Option({ title, description, rightContent, onPress, isFirst, isLast }) {
    const { colors } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            style={{
                ...styles.container,
                backgroundColor: colors.surface,
                borderTopLeftRadius: isFirst ? COMMONS.radius : 0,
                borderTopRightRadius: isFirst ? COMMONS.radius : 0,
                borderBottomLeftRadius: isLast ? COMMONS.radius : 0,
                borderBottomRightRadius: isLast ? COMMONS.radius : 0
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
        gap: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    left: {
        flex: 1,
        gap: 4
    }
})
