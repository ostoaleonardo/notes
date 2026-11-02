import { useMemo } from 'react'
import { Checkbox as ComposeCheckbox, Host } from '@expo/ui/jetpack-compose'

import { getCheckboxColors } from '@/ui/utils/compose-colors'
import { useTheme } from '@/ui/hooks/use-theme'

export function Checkbox({ checked }) {
    const { colors, dark } = useTheme()
    const checkboxColors = useMemo(() => getCheckboxColors(colors), [colors])

    return (
        <Host matchContents colorScheme={dark ? 'dark' : 'light'} pointerEvents='none'>
            <ComposeCheckbox value={checked} colors={checkboxColors} />
        </Host>
    )
}
