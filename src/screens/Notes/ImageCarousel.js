import { ImagePreview, Scroll } from '@/components'

export function ImageCarousel({ images, setImages, onOpenImage }) {
    const onRemoveImage = (image) => {
        setImages(images.filter((img) => img !== image))
    }

    return (
        <Scroll
            horizontal
            overScrollMode='never'
            containerStyle={{
                maxHeight: 100
            }}
            contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 24,
                gap: 8
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
    )
}
