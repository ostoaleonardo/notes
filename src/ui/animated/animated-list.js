import { StyleSheet, View } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'

import { Typography } from '@/ui/typography'

import { OPACITY, SPACING } from '@/ui/tokens/theme'

export const AnimatedList = ({
    emptyLabel,
    gap = SPACING.lg,
    contentContainerStyle,
    ...props
}) => {
    return (
        <Animated.FlatList
            style={styles.base}
            contentContainerStyle={StyleSheet.flatten([styles.list, { gap }, contentContainerStyle])}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            itemLayoutAnimation={LinearTransition}
            ListEmptyComponent={() => (
                <View style={styles.empty}>
                    <Typography
                        opacity={OPACITY.muted}
                        variant='bodySmall'
                        textAlign='center'
                    >
                        {emptyLabel}
                    </Typography>
                </View>
            )}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    base: {
        width: '100%'
    },
    list: {
        flexGrow: 1
    },
    empty: {
        flex: 1,
        justifyContent: 'center'
    }
})
