import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { useGroupPosition } from '@/hooks/use-group-position'
import { getStackedRadiusStyle } from '@/utils/group-position'

import { MENU } from '@/constants/components'
import { TRANSPARENT } from '@/constants/themes'
import { RADIUS, BORDER_WIDTH } from '@/constants/theme'

export function MenuGroup({ children }) {
    const { colors } = useTheme()
    const position = useGroupPosition()

    return (
        <View
            style={{
                borderWidth: BORDER_WIDTH.thin,
                paddingVertical: MENU.paddingVertical,
                paddingHorizontal: MENU.paddingHorizontal,
                overflow: 'hidden',
                ...getStackedRadiusStyle(position, RADIUS.md),
                borderColor: colors.onBackground + TRANSPARENT[5],
                backgroundColor: colors.surface
            }}
        >
            {children}
        </View>
    )
}
