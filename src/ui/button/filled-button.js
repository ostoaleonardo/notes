import { Button } from '@expo/ui/jetpack-compose'

import { ComposeButton } from '@/ui/button/compose-button'

export const FilledButton = (props) => (
    <ComposeButton
        component={Button}
        variant='filled'
        {...props}
    />
)
