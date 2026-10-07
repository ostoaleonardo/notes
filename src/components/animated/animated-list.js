import { StyleSheet, View } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'

import { Typography } from '@/components/typography'

import { OPACITY } from '@/constants/theme'

export function AnimatedList({ emptyLabel, gap = 16, contentContainerStyle, ...props }) {
    return (
        <Animated.FlatList
            style={styles.base}
            contentContainerStyle={{ ...styles.list, gap, ...contentContainerStyle }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            itemLayoutAnimation={LinearTransition}
            ListEmptyComponent={() => (
                <View style={styles.empty}>
                    <Typography
                        opacity={OPACITY.muted}
                        variant='caption'
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
