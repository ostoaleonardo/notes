import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { OutlinedButton as ComposeOutlinedButton } from '@expo/ui/jetpack-compose'
import { border } from '@expo/ui/jetpack-compose/modifiers'

import { ButtonContent } from '@/ui/button/button-content'
import { getButtonColors } from '@/ui/utils/compose-colors'

import { BORDER_WIDTH } from '@/ui/tokens/theme'

export function OutlinedButton({ children, onPress, disabled = false, loading = false }) {
    const { colors } = useTheme()
    const buttonColors = useMemo(() => getButtonColors(colors, 'outlined'), [colors])
    const modifiers = useMemo(
        () => [border(BORDER_WIDTH.thin, colors.outline)],
        [colors.outline]
    )

    return (
        <ComposeOutlinedButton
            colors={buttonColors}
            modifiers={modifiers}
            enabled={!disabled && !loading}
            onClick={onPress}
        >
            <ButtonContent loading={loading}>{children}</ButtonContent>
        </ComposeOutlinedButton>
    )
}
