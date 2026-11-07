import { TextField } from '@expo/ui/jetpack-compose'

import { MaterialTextField } from '@/ui/input/material-text-field'

export const FilledTextField = (props) => (
    <MaterialTextField
        Field={TextField}
        {...props}
    />
)
