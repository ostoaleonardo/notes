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
        >
            <Swipeable
                ref={ref}
                onSwipeableOpen={onOpen}
                renderRightActions={() =>
                    <DeleteAction onPress={onDelete} />
                }
                containerStyle={styles.container}
            >
                {children}
            </Swipeable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24
    }
})
