import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { openImagePicker } from '@/utils'
import { Camera, CheckList, Lock, Picture, Unlock } from '@/icons'

export function BottomEditorBar({ onAddImage, onToggleEditor, hasPassword, onOpenPassword }) {
    const { colors } = useTheme()
    const { background, onBackground } = colors

    const iconProps = { color: onBackground }

    const handleImagePicker = async (type) => {
        const assets = await openImagePicker(type)
        if (assets) onAddImage(assets)
    }

    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: background
            }}
        >
            <View style={{ flexDirection: 'row' }}>
                <IconButton
                    onPress={() => handleImagePicker('camera')}
                    icon={() => <Camera {...iconProps} />}
                />
                <IconButton
                    onPress={() => handleImagePicker('gallery')}
                    icon={() => <Picture {...iconProps} />}
                />
                <IconButton
                    onPress={onToggleEditor}
                    icon={() => <CheckList color={colors.onSurface} />}
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
