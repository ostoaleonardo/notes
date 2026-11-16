import { memo } from 'react'

import { SwatchOption } from './swatch-option'

import { COLOR_OPTION } from '@/constants/components'

export const ColorOption = memo(({
    name,
    active,
    onPress,
    children,
    options
}) => {
    const colors = options[name]

    return (
        <SwatchOption
            active={active}
            onPress={onPress}
            swatchStyle={{
                borderWidth: COLOR_OPTION.borderWidth,
                borderColor: colors.borderColor,
                backgroundColor: colors.background
            }}
        >
            {children}
        </SwatchOption>
    )
})
