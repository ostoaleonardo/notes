import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS, BORDER_WIDTH } from '@/constants/theme'

export function MenuGroup({ children, first = true, last = true }) {
    const { colors } = useTheme()
    const topRadius = first ? RADIUS.lg : RADIUS.md
    const bottomRadius = last ? RADIUS.lg : RADIUS.md

    return (
        <View
            style={{
                borderWidth: BORDER_WIDTH.thin,
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
