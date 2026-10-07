import { Image } from 'expo-image'
import { IconButton, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ResumableZoom, fitContainer, useImageResolution } from 'react-native-zoom-toolkit'

import { Close } from '@/icons/close'

import { SPACING } from '@/constants/theme'
import { IMAGE_VIEWER_MAX_SCALE } from '@/constants/image'

export function ImageViewer({ url, onClose }) {
    const { t } = useTranslation()
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
                accessibilityLabel={t('button.close')}
                style={{
                    ...styles.close,
                    top: insets.top + SPACING.sm,
                    right: insets.right + SPACING.sm
                }}
            />

            {url && (
                <ResumableZoom maxScale={resolution ?? IMAGE_VIEWER_MAX_SCALE}>
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
