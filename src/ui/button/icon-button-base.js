import { useMemo } from 'react'
import { View } from 'react-native'

import { ComposeIconButton, DEFAULT_APPEARANCE } from '@/ui/button/compose-icon-button'
import { ComposeHost } from '@/ui/compose-context'

import { SIZE } from '@/ui/tokens/theme'

export const IconButtonBase = ({
    appearance,
    style,
    ...props
}) => {
    const { box } = { ...DEFAULT_APPEARANCE, ...appearance }

    const inset = useMemo(() => ({ margin: Math.min(0, box - SIZE.lg) / 2 }), [box])

    return (
        <View style={style}>
            <View style={inset}>
                <ComposeHost>
                    <ComposeIconButton
                        appearance={appearance}
                        {...props}
                    />
                </ComposeHost>
            </View>
        </View>
    )
}
