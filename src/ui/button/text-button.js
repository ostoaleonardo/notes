import { TextButton as ComposeTextButton } from '@expo/ui/jetpack-compose'

import { ComposeButton } from '@/ui/button/compose-button'

export const TextButton = (props) => (
    <ComposeButton
        component={ComposeTextButton}
        variant='text'
        {...props}
    />
)
