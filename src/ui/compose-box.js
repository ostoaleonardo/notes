import { useMemo } from 'react'
import { Box } from '@expo/ui/jetpack-compose'
import { size as sizeModifier } from '@expo/ui/jetpack-compose/modifiers'

export const ComposeBox = ({ size, children }) => {
    const modifiers = useMemo(() => [sizeModifier(size, size)], [size])

    return (
        <Box
            contentAlignment='center'
            modifiers={modifiers}
        >
            {children}
        </Box>
    )
}
