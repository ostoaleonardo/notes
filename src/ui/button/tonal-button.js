import { FilledTonalButton as ComposeTonalButton } from '@expo/ui/jetpack-compose'

import { ComposeButton } from '@/ui/button/compose-button'

export const TonalButton = (props) => (
    <ComposeButton
        component={ComposeTonalButton}
        variant='tonal'
        {...props}
    />
)
