import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'

import { RADIUS } from '@/constants/themes'

export function Option({ title, description, rightContent, onPress, visible = true, isFirst, isLast }) {
    const { colors } = useTheme()

    if (!visible) return null

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
