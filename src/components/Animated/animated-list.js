import { StyleSheet, View } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'
import { Typography } from '../typography'

export function AnimatedList({ emptyLabel, gap = 16, ...props }) {
    return (
        <Animated.FlatList
            style={styles.base}
            contentContainerStyle={{ ...styles.list, gap }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            itemLayoutAnimation={LinearTransition}
            ListEmptyComponent={() => (
                <View style={styles.empty}>
                    <Typography
                        opacity={0.5}
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
        width: '100%',
    },
    list: {
        flexGrow: 1,
        paddingBottom: 24
    },
    empty: {
        flex: 1,
        justifyContent: 'center'
    }
})
