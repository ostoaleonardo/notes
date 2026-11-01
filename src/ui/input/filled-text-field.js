import { TextField } from '@expo/ui/jetpack-compose'

import { MaterialTextField } from '@/ui/input/material-text-field'

export function FilledTextField(props) {
    return <MaterialTextField Field={TextField} {...props} />
}
