import { Pressable, StyleSheet } from 'react-native'
import Animated, { CurvedTransition, FadeInUp } from 'react-native-reanimated'
import { Typography } from '../Text'
import { Check } from '../Check'
import { COLORS } from '@/constants'

export function Category({ category, onPress, isSelected }) {
    return (
        <Animated.View
            entering={FadeInUp}
            layout={CurvedTransition}
        >
            <Pressable
                onPress={onPress}
                style={styles.container}
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
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: COLORS.white5
    },
})
