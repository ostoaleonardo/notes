import { memo } from 'react'

import { SwatchOption } from './swatch-option'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export const FontOption = memo(({
    fontFamily,
    preview,
    active,
    onPress,
    testID,
    children
}) => {
    const { colors } = useTheme()

    return (
        <SwatchOption
            active={active}
            onPress={onPress}
            testID={testID}
            swatchStyle={{ backgroundColor: active ? colors.tertiary : colors.surfaceVariant }}
            swatch={(
                <Typography
                    fontSize={TYPOGRAPHY_SIZE_VARIANTS.headlineSmall}
                    color={active ? colors.onTertiary : colors.onBackground}
                    styleProps={{ fontFamily }}
                >
                    {preview}
                </Typography>
            )}
        >
            {children}
        </SwatchOption>
    )
})
