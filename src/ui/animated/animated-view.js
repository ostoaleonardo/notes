import Animated, { LinearTransition } from 'react-native-reanimated'

export const AnimatedView = ({ children, ...props }) => {
    return (
        <Animated.View
            layout={LinearTransition}
            {...props}
        >
            {children}
        </Animated.View>
    )
}
