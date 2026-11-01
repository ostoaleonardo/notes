import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { TextButton as ComposeTextButton } from '@expo/ui/jetpack-compose'
import { testID as testIdModifier } from '@expo/ui/jetpack-compose/modifiers'

import { ButtonContent } from '@/ui/button/button-content'
import { ComposeHost } from '@/ui/compose-context'
import { getButtonColors } from '@/ui/utils/compose-colors'

export function TextButton({
    children,
    onPress,
    disabled = false,
    loading = false,
    testID,
    style
}) {
    const { colors } = useTheme()
    const buttonColors = useMemo(() => getButtonColors(colors, 'text'), [colors])
    const modifiers = useMemo(() => (testID ? [testIdModifier(testID)] : undefined), [testID])

    return (
        <ComposeHost style={style}>
            <ComposeTextButton
                colors={buttonColors}
                modifiers={modifiers}
                enabled={!disabled && !loading}
                onClick={onPress}
            >
                <ButtonContent loading={loading}>
                    {children}
                </ButtonContent>
            </ComposeTextButton>
        </ComposeHost>
    )
}
