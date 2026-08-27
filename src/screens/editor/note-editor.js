import { View } from 'react-native'
import { MarkdownEditor } from '@/components'

export function NoteEditor({
    value, setValue,
    markdownAction,
    isEditing,
    onFocus, onBlur,
    title, setTitle,
    titlePlaceholder,
    dateLabel
}) {
    return (
        <View style={{ flex: 1 }}>
            <MarkdownEditor
                value={value}
                setValue={setValue}
                markdownAction={markdownAction}
                isEditing={isEditing}
                onFocus={onFocus}
                onBlur={onBlur}
                title={title}
                setTitle={setTitle}
                titlePlaceholder={titlePlaceholder}
                dateLabel={dateLabel}
            />
        </View>
    )
}
