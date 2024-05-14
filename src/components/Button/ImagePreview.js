import { Image, Pressable, StyleSheet } from 'react-native'
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated'
import { Cross } from '@/icons'
import { COLORS } from '@/constants'

export function ImagePreview({ image, openImage, removeImage }) {
    return (
        <Animated.View
            entering={FadeInDown}
            exiting={FadeOutDown}
            layout={LinearTransition}
        >
            <Pressable
                onPress={openImage}
                style={styles.container}
            >
                <Image
                    style={styles.image}
                    source={{ uri: image }}
                />

                {removeImage && (
                    <Pressable
                        onPress={removeImage}
                        style={styles.removeButton}
                    >
                        <Cross
                            width={24}
                            height={24}
                            rotation={45}
                            color={COLORS.text}
                        />
                    </Pressable>
                )}
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        height: 100,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    removeButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.overlay,
    },
})
