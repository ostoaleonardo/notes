import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { Checkbox as ComposeCheckbox, Host } from '@expo/ui/jetpack-compose'

import { getCheckboxColors } from '@/ui/utils/compose-colors'

export function Checkbox({ checked }) {
    const { colors } = useTheme()
    const checkboxColors = useMemo(() => getCheckboxColors(colors), [colors])

    return (
        <Host matchContents pointerEvents='none'>
            <ComposeCheckbox value={checked} colors={checkboxColors} />
        </Host>
    )
}
