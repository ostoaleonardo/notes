import { View } from 'react-native'
import { MarkdownEditor, Section } from '@/components'

export function NoteEditor({
    value, setValue,
    markdownAction,
    isEditing
}) {
    return (
        <View style={{ paddingBottom: 80 }}>
            <Section containerStyle={{ paddingHorizontal: 16 }}>
                <MarkdownEditor
                    value={value}
                    setValue={setValue}
                    markdownAction={markdownAction}
                    isEditing={isEditing}
                />
            </Section>
        </View>
    )
}
