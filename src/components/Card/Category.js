import { Pressable, StyleSheet } from 'react-native'
import Animated, { CurvedTransition, FadeInUp } from 'react-native-reanimated'
import { Typography } from '../Text'
import { Check } from '../Check'
import { colors } from '@/constants'

export function Category({ category, onPress, isSelected }) {
    return (
        <Animated.View
            exiting={FadeInUp}
            layout={CurvedTransition}
            style={styles.container}
        >
            <Pressable
                onPress={onPress}
                style={styles.categoryContainer}
            >
                <Typography variant='paragraph'>
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
        alignItems: 'center',
    },
    categoryContainer: {
        width: '100%',
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: colors.text5,
    },
})
