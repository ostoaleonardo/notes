import { ImagePreview, Scroll } from '@/components'

export function ImageCarousel({ images, setImages, onOpenImage, readOnly }) {
    const onRemoveImage = (image) => {
        setImages(images.filter((img) => img !== image))
    }

    return (
        <Scroll
            horizontal
            overScrollMode='never'
            contentContainerStyle={{
                flexGrow: 1,
                gap: 8,
                paddingHorizontal: 24,
            }}
            containerStyle={{
                maxHeight: 100,
            }}
        >
            {images.length > 0 &&
                images.map((image, index) => (
                    <ImagePreview
                        key={index}
                        image={image}
                        openImage={() => onOpenImage(index)}
                        removeImage={!readOnly && (() => onRemoveImage(image))}
                    />
                ))
            }
        </Scroll>
    )
}
