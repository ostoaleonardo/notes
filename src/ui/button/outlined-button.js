import { OutlinedButton as ComposeOutlinedButton } from '@expo/ui/jetpack-compose'
import { border } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeButton } from '@/ui/button/compose-button'

import { BORDER_WIDTH } from '@/ui/tokens/theme'

const getOutlineModifiers = (colors) => [border(BORDER_WIDTH.thin, colors.outline)]

export const OutlinedButton = (props) => (
    <ComposeButton
        component={ComposeOutlinedButton}
        variant='outlined'
        getModifiers={getOutlineModifiers}
        {...props}
    />
)
