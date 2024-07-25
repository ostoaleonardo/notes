import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { IconButton } from '@/components'
import { openImagePicker } from '@/utils'
import { Camera, Check, CheckBox, Lock, Picture, Unlock } from '@/icons'

export function BottomOptionsBar({ onAddImage, hasPassword, onAddItemList, onOpenPassword, onSave }) {
    const { colors } = useTheme()

    const iconProps = { color: colors.onBackground }

    const handleImagePicker = async (type) => {
        const assets = await openImagePicker(type)

        if (assets) {
            onAddImage(assets)
        }
    }

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                padding: 8,
                paddingHorizontal: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: colors.background
            }}
        >
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <IconButton
                    variant='light'
                    onPress={() => handleImagePicker('camera')}
                    icon={<Camera {...iconProps} />}
                />
                <IconButton
                    variant='light'
                    onPress={() => handleImagePicker('gallery')}
                    icon={<Picture {...iconProps} />}
                />
                <IconButton
                    variant='light'
                    onPress={onAddItemList}
                    icon={<CheckBox {...iconProps} />}
                />
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
                <IconButton
                    variant='light'
                    onPress={onOpenPassword}
                    icon={
                        hasPassword
                            ? <Lock {...iconProps} />
                            : <Unlock {...iconProps} />
                    }
                />
                <IconButton
                    onPress={onSave}
                    icon={<Check color={colors.background} />}
                />
            </View>
        </View>
    )
}
