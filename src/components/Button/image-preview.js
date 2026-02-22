import { Image } from 'expo-image'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated'
import { Galeria } from '@nandorojo/galeria'
import { Close } from '@/icons'

export function ImagePreview({ index, url, onRemove, width }) {
    const { colors } = useTheme()

    return (
        <Animated.View
            entering={FadeInDown}
            exiting={FadeOutDown}
            layout={LinearTransition}
            style={{ width: width + '%', aspectRatio: 1 }}
        >
            <Galeria.Image index={index}>
                <Image
                    source={url}
                    recyclingKey={url + index}
                    style={styles.image}
                />
            </Galeria.Image>

            {onRemove && (
                <Pressable
                    onPress={onRemove}
                    style={{
                        ...styles.removeButton,
                        backgroundColor: colors.surface + 'bf'
                    }}
                >
                    <Close color={colors.onSurface} />
                </Pressable>
            )}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        height: 100
    },
    image: {
        width: '100%',
        height: '100%'
    },
    removeButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
