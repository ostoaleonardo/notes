import { StyleSheet, View } from 'react-native'
import Animated, { CurvedTransition } from 'react-native-reanimated'
import { Checkbox, useTheme } from 'react-native-paper'
import { Typography } from '../../Typography'
0
export function ListItemPreview({ type, index, value, status }) {
    const { colors } = useTheme()

    const bulletStyle = {
        width: 8,
        height: 8,
        marginRight: 8,
        borderRadius: 4,
        backgroundColor: colors.onBackground
    }

    const renderListType = () => {
        switch (type) {
            case 'bulleted':
                return <View style={bulletStyle} />
            case 'numbered':
                return <Typography>{index}.</Typography>
            default:
                return <Checkbox disabled status={status} />
        }
    }

    return (
        <Animated.View
            layout={CurvedTransition}
            style={style.container}
        >
            {renderListType()}
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
        alignItems: 'center',
        justifyContent: 'center'
    }
})
