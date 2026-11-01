import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { TextButton as ComposeTextButton } from '@expo/ui/jetpack-compose'

import { ButtonContent } from '@/ui/button/button-content'
import { getButtonColors } from '@/ui/utils/compose-colors'

export function TextButton({ children, onPress, disabled = false, loading = false }) {
    const { colors } = useTheme()
    const buttonColors = useMemo(() => getButtonColors(colors, 'text'), [colors])

    return (
        <ComposeTextButton
            colors={buttonColors}
            enabled={!disabled && !loading}
            onClick={onPress}
        >
            <ButtonContent loading={loading}>{children}</ButtonContent>
        </ComposeTextButton>
    )
}
