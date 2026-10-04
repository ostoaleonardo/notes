import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS } from '@/constants/radius'

export function MenuGroup({ children, first = true, last = true, color }) {
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
                backgroundColor: color || colors.surface
            }}
        >
            {children}
        </View>
    )
}
