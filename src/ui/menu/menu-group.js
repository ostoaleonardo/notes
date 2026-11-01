import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { useGroupPosition } from '@/ui/hooks/use-group-position'
import { getStackedRadiusStyle } from '@/ui/utils/group-position'

import { MENU } from '@/ui/tokens/components'
import { TRANSPARENT } from '@/ui/tokens/transparent'
import { RADIUS, BORDER_WIDTH } from '@/ui/tokens/theme'

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
