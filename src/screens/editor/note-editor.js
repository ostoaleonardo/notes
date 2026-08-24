import { View } from 'react-native'
import { MarkdownEditor, Section } from '@/components'

export function NoteEditor({
    value, setValue,
    markdownAction,
    isEditing,
    onFocus, onBlur
}) {
    return (
        <View style={{ flex: 1, paddingBottom: 80 }}>
            <Section containerStyle={{ flex: 1, paddingHorizontal: 16 }} contentStyle={{ flex: 1 }}>
                <MarkdownEditor
                    value={value}
                    setValue={setValue}
                    markdownAction={markdownAction}
                    isEditing={isEditing}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </Section>
        </View>
    )
}
