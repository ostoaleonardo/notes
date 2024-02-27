import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { CurvedTransition, FadeOutLeft } from 'react-native-reanimated'
import { Swipeable } from 'react-native-gesture-handler'
import { Check } from '../Check'
import { DeleteAction } from '../SwipeableCard'
import { useCategories } from '../../hooks'
import { colors, fonts } from '../../constants'

export function Category({ category, onPress, isSelected }) {
    const { removeCategory } = useCategories()

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
                <Text style={styles.label}>
                    {category}
                </Text>
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
    swipeableContainer: {
        minWidth: '100%',
        alignItems: 'center',
    },
    categoryContainer: {
        minWidth: '100%',
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 2,
        justifyContent: 'space-between',
        borderBottomColor: `${colors.text}0D`,
    },
    label: {
        fontSize: 16,
        fontFamily: fonts.mono,
        color: `${colors.text}80`,
    },
})
