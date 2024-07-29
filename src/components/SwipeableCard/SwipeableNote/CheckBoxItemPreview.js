import { StyleSheet, View } from 'react-native'
import Animated, { CurvedTransition } from 'react-native-reanimated'
import { Checkbox } from 'react-native-paper'
import { Typography } from '../../Text'
0
export function CheckBoxItemPreview({ value, status }) {
    return (
        <Animated.View
            layout={CurvedTransition}
            style={style.container}
        >
            <Checkbox
                disabled
                status={status}
            />
            <View style={{ flex: 1 }}>
                <Typography
                    variant='caption'
                    numberOfLines={1}
                >
                    {value}
                </Typography>
            </View>
        </Animated.View>
    )
}

const style = StyleSheet.create({
    container: {
        height: 30,
        gap: 4,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
