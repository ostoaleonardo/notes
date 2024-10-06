import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { ListMenu } from '@/components'
import { openImagePicker } from '@/utils'
import { Camera, Lock, Picture, Unlock } from '@/icons'

export function BottomOptionsBar({ onAddImage, onListType, hasPassword, onOpenPassword }) {
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
            <View style={styles.section}>
                <IconButton
                    onPress={() => handleImagePicker('camera')}
                    icon={() => <Camera {...iconProps} />}
                />
                <IconButton
                    onPress={() => handleImagePicker('gallery')}
                    icon={() => <Picture {...iconProps} />}
                />

                <ListMenu onListType={onListType} />
            </View>

            <View style={styles.section}>
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
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    section: {
        flexDirection: 'row'
    }
})
