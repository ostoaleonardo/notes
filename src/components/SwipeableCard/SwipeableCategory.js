import { Pressable, StyleSheet } from 'react-native'
import Animated, { CurvedTransition, FadeInUp, SlideOutLeft } from 'react-native-reanimated'
import { Swipeable } from 'react-native-gesture-handler'
import { DeleteAction } from './DeleteAction'
import { Typography } from '../Text'
import { colors } from '@/constants'

export function SwipeableCategory({ category, onPress, onDelete }) {
    return (
        <Animated.View
            entering={FadeInUp}
            exiting={SlideOutLeft}
            layout={CurvedTransition}
            style={styles.container}
        >
            <Swipeable
                onSwipeableOpen={onDelete}
                overshootLeft={false}
                renderRightActions={() => (
                    <DeleteAction />
                )}
                containerStyle={styles.swipeableContainer}
            >
                <Pressable
                    onPress={onPress}
                    style={styles.categoryContainer}
                >
                    <Typography>
                        {category}
                    </Typography>
                </Pressable>
            </Swipeable>
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
        paddingHorizontal: 24,
    },
    categoryContainer: {
        minWidth: '100%',
        padding: 20,
        borderRadius: 16,
        backgroundColor: colors.foreground,
    },
})
