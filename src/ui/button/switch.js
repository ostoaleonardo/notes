import { useCallback, useMemo } from 'react'
import { Pressable, View } from 'react-native'
import { Host, Switch as ComposeSwitch } from '@expo/ui/jetpack-compose'

import { getSwitchColors } from '@/ui/utils/compose-colors'
import { useTheme } from '@/ui/hooks/use-theme'

export function Switch({ value, onValueChange, accessibilityLabel }) {
    const { colors } = useTheme()
    const switchColors = useMemo(() => getSwitchColors(colors), [colors])
    const onPress = useCallback(() => onValueChange(!value), [onValueChange, value])

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole='switch'
            accessibilityState={{ checked: value }}
            accessibilityLabel={accessibilityLabel}
        >
            <View importantForAccessibility='no-hide-descendants'>
                <Host matchContents pointerEvents='none'>
                    <ComposeSwitch value={value} colors={switchColors} />
                </Host>
            </View>
        </Pressable>
    )
}
