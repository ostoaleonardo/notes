
import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { openImagePicker } from '@/utils'
import { Camera, Lock, Picture, Unlock } from '@/icons'

export function BottomEditorBar({ onAddImage, hasPassword, onOpenPassword }) {
    const { colors } = useTheme()
    const { background, onBackground } = colors

    const iconProps = { color: onBackground }

    const onImagePicker = useCallback(async (type) => {
        const assets = await openImagePicker(type)
        if (assets) onAddImage(assets)
    }, [onAddImage])

    const onCamera = useCallback(() => onImagePicker('camera'), [onImagePicker])
    const onGallery = useCallback(() => onImagePicker('gallery'), [onImagePicker])

    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: background
            }}
        >
            <View style={{ flexDirection: 'row' }}>
                <IconButton
                    onPress={onCamera}
                    icon={() => <Camera {...iconProps} />}
                />
                <IconButton
                    onPress={onGallery}
                    icon={() => <Picture {...iconProps} />}
                />
            </View>

            <View style={{ flexDirection: 'row' }}>
                <IconButton
                    onPress={onOpenPassword}
                    icon={() => hasPassword
                        ? <Lock {...iconProps} />
                        : <Unlock {...iconProps} />
                    }
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})
