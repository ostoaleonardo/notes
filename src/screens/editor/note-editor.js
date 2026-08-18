import { View } from 'react-native'
import { MarkdownEditor, Section } from '@/components'
import { ImageCarousel } from '../notes'

export function NoteEditor({
    value, setValue,
    markdownAction,
    images, setImages,
    onGallery, isEditing
}) {
    const hasImages = images && images.length > 0

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

            {hasImages && (
                <ImageCarousel
                    images={images}
                    setImages={setImages}
                    onGallery={onGallery}
                />
            )}
        </View>
    )
}
