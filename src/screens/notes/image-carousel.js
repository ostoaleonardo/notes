import { StyleSheet, View } from 'react-native'
import { ImagePreview } from '@/components'
import { getDimensions } from '@/utils'

export function ImageCarousel({ images, setImages, onGallery }) {

    const width = getDimensions(images.length)

    const onRemoveImage = (image) => {
        setImages(images.filter((img) => img !== image))
    }

    return (
        <View style={styles.container}>
            {images.length > 0 && images.map((url, index) => (
                <ImagePreview
                    key={url}
                    index={index}
                    url={url}
                    width={width}
                    onGallery={() => onGallery(index)}
                    onRemove={() => onRemoveImage(url)}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexWrap: 'wrap',
        marginVertical: 24,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})
