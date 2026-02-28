import { useCallback, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { Gallery } from 'react-native-zoom-toolkit'
import { IconButton, useTheme } from 'react-native-paper'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GalleryImage } from './gallery-image'
import { AnimatedView } from '@/components'
import { Close } from '@/icons'

export const GalleryView = ({ index, images, visible, onClose }) => {
    const ref = useRef(null)
    const { colors } = useTheme()
    const { top } = useSafeAreaInsets()

    const renderItem = useCallback((item, index) => {
        return <GalleryImage uri={item} index={index} />
    }, [])

    const keyExtractor = useCallback((item, index) => {
        return item + index
    }, [])

    return (
        visible && (
            <View style={styles.container}>
                <View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: colors.backdrop
                    }}
                />

                <AnimatedView
                    entering={FadeInUp}
                    exiting={FadeOutUp}
                    style={{
                        ...styles.close,
                        top: top + 8,
                        right: 4
                    }}
                >
                    <IconButton
                        onPress={onClose}
                        icon={() => <Close color={colors.onSurface} />}
                        style={{ backgroundColor: colors.surface }}
                    />
                </AnimatedView>

                <Gallery
                    ref={ref}
                    data={images}
                    initialIndex={index}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                />
            </View>
        )
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 1,
        flex: 1,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    close: {
        position: 'absolute',
        zIndex: 2,
        right: 8
    }
})
