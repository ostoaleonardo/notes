import { StyleSheet, View } from 'react-native'
import { Galeria } from '@nandorojo/galeria'
import { ImagePreview } from '@/components'
import { getDimensions } from '@/utils'

export function ImageCarousel({ images, setImages }) {
    const width = getDimensions(images.length)

    const onRemoveImage = (image) => {
        setImages(images.filter((img) => img !== image))
    }

    return (
        <View style={styles.container}>
            <Galeria urls={images}>
                {images.length > 0 && images.map((url, index) => (
                    <ImagePreview
                        key={url}
                        index={index}
                        url={url}
                        width={width}
                        onRemove={() => onRemoveImage(url)}
                    />
                ))}
            </Galeria>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})
