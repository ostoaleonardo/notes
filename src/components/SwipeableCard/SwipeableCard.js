import { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import Animated, { CurvedTransition, FadeInUp, SlideOutLeft } from 'react-native-reanimated'
import { DeleteAction } from './DeleteAction'

export function SwipeableCard({ children, isOpen, onOpen, onDelete }) {
    const ref = useRef(null)

    useEffect(() => {
        if (!isOpen) {
            ref.current.close()
        }
    }, [isOpen])

    return (
        <Animated.View
            entering={FadeInUp}
            exiting={SlideOutLeft}
            layout={CurvedTransition}
            style={styles.container}
        >
            <Swipeable
                ref={ref}
                onSwipeableOpen={onOpen}
                containerStyle={styles.swipeable}
                renderRightActions={() =>
                    <DeleteAction onPress={onDelete} />
                }
            >
                {children}
            </Swipeable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    swipeable: {
        paddingHorizontal: 24
    }
})
