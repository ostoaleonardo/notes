import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { Host, Switch as ComposeSwitch } from '@expo/ui/jetpack-compose'

import { getSwitchColors } from '@/utils/compose-colors'

import { OPACITY } from '@/constants/theme'

export function Switch({ value, onValueChange, disabled = false }) {
    const { colors } = useTheme()
    const switchColors = useMemo(() => getSwitchColors(colors), [colors])

    return (
        <Host
            matchContents
            style={disabled && {
                opacity: OPACITY.disabled
            }}
        >
            <ComposeSwitch
                value={value}
                enabled={!disabled}
                colors={switchColors}
                onCheckedChange={onValueChange}
            />
        </Host>
    )
}
