import { View } from 'react-native'
import { MarkdownEditor } from '@/components'

export function NoteEditor({
    value, setValue,
    markdownAction,
    isEditing,
    onFocus, onBlur
}) {
    return (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <MarkdownEditor
                value={value}
                setValue={setValue}
                markdownAction={markdownAction}
                isEditing={isEditing}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        </View>
    )
}
