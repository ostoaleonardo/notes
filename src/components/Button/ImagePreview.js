import { Image, Pressable, StyleSheet } from 'react-native'
import { Cross } from '@/icons'
import { colors } from '@/constants'

export function ImagePreview({ image, openImage, removeImage }) {
    return (
        <Pressable
            onPress={openImage}
            style={styles.container}
        >
            <Image
                style={styles.image}
                source={{ uri: image }}
            />
            <Pressable
                onPress={removeImage}
                style={styles.removeButton}
            >
                <Cross
                    width={24}
                    height={24}
                    rotation={45}
                    color={colors.text}
                />
            </Pressable>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
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
        backgroundColor: colors.overlay,
    },
})
