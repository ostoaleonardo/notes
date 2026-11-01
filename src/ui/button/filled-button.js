import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { Button } from '@expo/ui/jetpack-compose'

import { ButtonContent } from '@/ui/button/button-content'
import { getButtonColors } from '@/ui/utils/compose-colors'

export function FilledButton({ children, onPress, disabled = false, loading = false }) {
    const { colors } = useTheme()
    const buttonColors = useMemo(() => getButtonColors(colors, 'filled'), [colors])

    return (
        <Button
            colors={buttonColors}
            enabled={!disabled && !loading}
            onClick={onPress}
        >
            <ButtonContent loading={loading}>{children}</ButtonContent>
        </Button>
    )
}
