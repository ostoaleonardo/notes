import { StyleSheet, View } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'
import { ImagePreview, PickerImage, Scroll } from '@/components'
import { COLORS } from '@/constants'

export function ImageCarousel({ images, onAddImage, onOpenImage, onRemoveImage, readOnly }) {
    return (
        <Scroll
            horizontal
            contentStyle={styles.container}
            containerStyle={{ maxHeight: 100 }}
        >
            {images.length > 0 &&
                images.map((image, index) => (
                    <ImagePreview
                        key={index}
                        image={image}
                        openImage={() => onOpenImage(index)}
                        removeImage={!readOnly && (() => onRemoveImage(index))}
                    />
                ))
            }

            {!readOnly && (
                <Animated.View
                    layout={LinearTransition}
                    style={styles.pickerContainer}
                >
                    <PickerImage
                        pickCamera
                        setImage={onAddImage}
                    />
                    <View style={styles.separator} />
                    <PickerImage setImage={onAddImage} />
                </Animated.View>
            )}
        </Scroll>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 8,
        flexDirection: 'row',
        paddingHorizontal: 24,
    },
    pickerContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    separator: {
        position: 'absolute',
        width: '100%',
        height: 1,
        opacity: 0.5,
        backgroundColor: COLORS.foreground,
    },
})
