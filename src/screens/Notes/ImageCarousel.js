import { View } from 'react-native'
import { ImagePreview, Scroll } from '@/components'

export function ImageCarousel({ images, setImages, onOpenImage }) {
    const onRemoveImage = (image) => {
        setImages(images.filter((img) => img !== image))
    }

    return (
        <View style={{ position: 'absolute', bottom: 0 }}>
            <Scroll
                horizontal
                overScrollMode='never'
                style={{ maxHeight: 100 }}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 16,
                    gap: 4
                }}
            >
                {images.length > 0 &&
                    images.map((image, index) => (
                        <ImagePreview
                            key={image}
                            image={image}
                            openImage={() => onOpenImage(index)}
                            removeImage={() => onRemoveImage(image)}
                        />
                    ))
                }
            </Scroll>
        </View>
    )
}
