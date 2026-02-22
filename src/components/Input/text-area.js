import { TextInput } from 'react-native'

export function TextArea({ ...props }) {
    return (
        <TextInput
            multiline
            {...props}
        />
    )
}
