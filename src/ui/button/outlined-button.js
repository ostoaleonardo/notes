import { OutlinedButton as ComposeOutlinedButton } from '@expo/ui/jetpack-compose'

import { ComposeButton } from '@/ui/button/compose-button'

export const OutlinedButton = (props) => (
    <ComposeButton
        component={ComposeOutlinedButton}
        variant='outlined'
        {...props}
    />
)
