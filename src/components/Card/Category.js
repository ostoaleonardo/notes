import { Pressable, StyleSheet } from 'react-native'
import Animated, { CurvedTransition, FadeOutLeft } from 'react-native-reanimated'
import { Typography } from '../Text'
import { Check } from '../Check'
import { colors } from '@/constants'

export function Category({ category, onPress, isSelected }) {
    return (
        <Animated.View
            exiting={FadeOutLeft}
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
        minWidth: '100%',
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 2,
        justifyContent: 'space-between',
        borderBottomColor: colors.text5,
    },
})
