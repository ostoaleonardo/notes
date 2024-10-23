import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FadeInUp } from 'react-native-reanimated'
import { AnimatedView, Checkbox, Typography } from '@/components'

export function CategoryOption({ category, onPress, isSelected }) {
    const { colors } = useTheme()
    const { onBackground } = colors

    return (
        <AnimatedView
            entering={FadeInUp}
        >
            <Pressable
                onPress={onPress}
                style={styles.container}
                android_ripple={{ color: onBackground + '1a' }}
            >
                <Typography>
                    {category}
                </Typography>
                <Checkbox checked={isSelected} />
            </Pressable>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
