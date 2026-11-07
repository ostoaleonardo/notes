import { useMemo } from 'react'
import { testID as testIdModifier } from '@expo/ui/jetpack-compose/modifiers'

import { ButtonContent } from '@/ui/button/button-content'
import { ComposeHost } from '@/ui/compose-context'
import { getButtonColors } from '@/ui/utils/compose-colors'
import { useTheme } from '@/ui/hooks/use-theme'

export const ComposeButton = ({
    component: Component,
    variant,
    getModifiers,
    children,
    onPress,
    disabled = false,
    loading = false,
    testID,
    style
}) => {
    const { colors } = useTheme()
    const buttonColors = useMemo(() => getButtonColors(colors, variant), [colors, variant])
    const modifiers = useMemo(() => {
        const list = [...(getModifiers?.(colors) ?? []), ...(testID ? [testIdModifier(testID)] : [])]
        return list.length ? list : undefined
    }, [colors, getModifiers, testID])

    return (
        <ComposeHost style={style}>
            <Component
                colors={buttonColors}
                modifiers={modifiers}
                enabled={!disabled && !loading}
                onClick={onPress}
            >
                <ButtonContent loading={loading}>
                    {children}
                </ButtonContent>
            </Component>
        </ComposeHost>
    )
}
