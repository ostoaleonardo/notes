import { Image } from 'expo-image'
import { IconButton, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { ResumableZoom, fitContainer, useImageResolution } from 'react-native-zoom-toolkit'
import { Close } from '@/icons'

export function ImageViewer({ url, onClose }) {
    const { colors } = useTheme()
    const { width, height } = useWindowDimensions()
    const insets = useSafeAreaInsets()

    const { resolution } = useImageResolution({ uri: url || '' })

    const container = { width, height }
    const size = resolution ? fitContainer(
        resolution.width / resolution.height, container
    ) : container

    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: colors.backdrop
            }}
        >
            <IconButton
                mode='contained'
                onPress={onClose}
                icon={(props) => <Close {...props} />}
                containerColor={colors.surface}
                style={{
                    ...styles.close,
                    top: insets.top + 8,
                    right: insets.right + 8
                }}
            />

            {url && (
                <ResumableZoom maxScale={resolution ?? 6}>
                    <Image
                        style={size}
                        source={{ uri: url }}
                        contentFit='contain'
                    />
                </ResumableZoom>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    close: {
        position: 'absolute',
        zIndex: 1
    }
})
