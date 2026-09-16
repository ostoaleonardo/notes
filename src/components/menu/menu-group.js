import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { RADIUS, TRANSPARENT } from '@/constants/themes'

export function MenuGroup({ children, first = true, last = true }) {
    const { colors } = useTheme()
    const topRadius = first ? RADIUS.outer : RADIUS.inner
    const bottomRadius = last ? RADIUS.outer : RADIUS.inner

    return (
        <View
            style={{
                borderWidth: 1,
                overflow: 'hidden',
                borderTopLeftRadius: topRadius,
                borderTopRightRadius: topRadius,
                borderBottomLeftRadius: bottomRadius,
                borderBottomRightRadius: bottomRadius,
                borderColor: colors.onBackground + TRANSPARENT[5],
                backgroundColor: colors.surface
            }}
        >
            {children}
        </View>
    )
}
