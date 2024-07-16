import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import Animated, { CurvedTransition, FadeInUp } from 'react-native-reanimated'
import { Typography } from '../Text'
import { Check } from '../Check'

export function Category({ category, onPress, isSelected }) {
    const { colors } = useTheme()

    return (
        <Animated.View
            entering={FadeInUp}
            layout={CurvedTransition}
        >
            <Pressable
                onPress={onPress}
                style={styles.container}
                android_ripple={{ color: colors.onBackground + '1a' }}
            >
                <Typography>
                    {category}
                </Typography>
                <Check checked={isSelected} />
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
