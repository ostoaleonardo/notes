import { Pressable, StyleSheet, Text } from 'react-native'
import Animated, { CurvedTransition, FadeOutLeft } from 'react-native-reanimated'
import { Check } from './Check'
import { colors, fonts } from '@/constants'

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
    categoryContainer: {
        minWidth: '100%',
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 2,
        justifyContent: 'space-between',
        borderBottomColor: colors.text5,
    },
    label: {
        fontSize: 16,
        color: colors.text50,
        fontFamily: fonts.mono,
    },
})
