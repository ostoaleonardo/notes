import { View } from 'react-native'
import { Galeria } from '@nandorojo/galeria'
import { ImagePreview, Scroll } from '@/components'

export function ImageCarousel({ images, setImages }) {
    const onRemoveImage = (image) => {
        setImages(images.filter((img) => img !== image))
    }

    return (
        <View style={{ position: 'absolute', bottom: 56, zIndex: 0 }}>
            <Galeria urls={images}>
                <Scroll
                    horizontal
                    overScrollMode='never'
                    style={{ maxHeight: 100 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 16,
                        gap: 8
                    }}
                >
                    {images.length > 0 && images.map((url, index) => (
                        <ImagePreview
                            key={url}
                            index={index}
                            url={url}
                            onRemove={() => onRemoveImage(url)}
                        />
                    ))}
                </Scroll>
            </Galeria>
        </View>
    )
}
