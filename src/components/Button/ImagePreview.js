import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated'
import { Galeria } from '@nandorojo/galeria'
import { Image } from 'expo-image'
import { Close } from '@/icons'

export function ImagePreview({ index, url, onRemove }) {
    const { colors } = useTheme()

    return (
        <Animated.View
            entering={FadeInDown}
            exiting={FadeOutDown}
            layout={LinearTransition}
        >
            <Galeria.Image index={index} style={{ width: 100, height: 100 }}>
                <Image source={url} recyclingKey={url + index} style={styles.image} />
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
        height: '100%',
        borderRadius: 24
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
