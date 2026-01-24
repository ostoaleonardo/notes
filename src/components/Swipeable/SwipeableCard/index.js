import { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FadeInUp, SlideOutLeft } from 'react-native-reanimated'
import { AnimatedView } from '../../Animated'
import { DeleteAction } from '../Actions'

export function SwipeableCard({ children, isOpen, onOpen, onDelete, ...props }) {
    const ref = useRef(null)

    useEffect(() => {
        if (!isOpen) {
            ref.current.close()
        }
    }, [isOpen])

    return (
        <AnimatedView
            entering={FadeInUp}
            exiting={SlideOutLeft}
            style={styles.container}
        >
            <Swipeable
                ref={ref}
                onSwipeableOpen={onOpen}
                containerStyle={styles.swipeable}
                renderRightActions={() => <DeleteAction onPress={onDelete} />}
                {...props}
            >
                {children}
            </Swipeable>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    swipeable: {
        paddingHorizontal: 16
    }
})
