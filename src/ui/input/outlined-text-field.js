import { OutlinedTextField as ComposeOutlinedTextField } from '@expo/ui/jetpack-compose'

import { MaterialTextField } from '@/ui/input/material-text-field'

import { TRANSPARENT } from '@/ui/tokens/transparent'

export function OutlinedTextField(props) {
    return (
        <MaterialTextField
            Field={ComposeOutlinedTextField}
            containerColor={TRANSPARENT.color}
            {...props}
        />
    )
}
