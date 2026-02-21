import { View } from 'react-native'
import { MarkdownEditor, Section } from '@/components'
import { ImageCarousel } from '@/screens'

export function NoteEditor({
    value, setValue,
    action, setAction,
    images, setImages, isEditing
}) {
    const hasImages = images && images.length > 0

    return (
        <View style={{ paddingBottom: 80 }}>
            <Section containerStyle={{ paddingHorizontal: 16 }}>
                <MarkdownEditor
                    value={value}
                    setValue={setValue}
                    action={action}
                    setAction={setAction}
                    isEditing={isEditing}
                />
            </Section>

            {hasImages && (
                <ImageCarousel
                    images={images}
                    setImages={setImages}
                />
            )}
        </View>
    )
}
