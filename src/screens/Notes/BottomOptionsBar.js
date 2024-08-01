import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Menu, useTheme } from 'react-native-paper'
import { IconButton } from '@/components'
import { openImagePicker } from '@/utils'
import { BulletedList, Camera, CheckList, Lock, NumberedList, Picture, Unlock } from '@/icons'
import { FONTS } from '@/constants'

const menuItemStyle = {
    fontSize: 12,
    textTransform: 'uppercase',
    fontFamily: FONTS.azeretLight
}

export function BottomOptionsBar({ onAddImage, onListType, hasPassword, onOpenPassword }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const [menuVisible, setMenuVisible] = useState(false)

    const iconProps = { color: colors.onBackground }

    const onOpenMenu = () => setMenuVisible(true)
    const onCloseMenu = () => setMenuVisible(false)

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

                <Menu
                    elevation={0}
                    visible={menuVisible}
                    onDismiss={onCloseMenu}
                    anchor={
                        <IconButton
                            variant='light'
                            onPress={onOpenMenu}
                            icon={<CheckList {...iconProps} />}
                        />
                    }
                    contentStyle={{
                        borderRadius: 24,
                        overflow: 'hidden',
                        backgroundColor: colors.surface
                    }}
                >
                    <Menu.Item
                        title={t('list.bulleted')}
                        titleStyle={menuItemStyle}
                        onPress={() => onListType('bulleted')}
                        leadingIcon={() => <BulletedList {...iconProps} />}
                    />
                    <Menu.Item
                        title={t('list.numbered')}
                        titleStyle={menuItemStyle}
                        onPress={() => onListType('numbered')}
                        leadingIcon={() => <NumberedList {...iconProps} />}
                    />
                    <Menu.Item
                        title={t('list.checklist')}
                        titleStyle={menuItemStyle}
                        onPress={() => onListType('checklist')}
                        leadingIcon={() => <CheckList {...iconProps} />}
                    />
                </Menu>
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
            </View>
        </View>
    )
}
