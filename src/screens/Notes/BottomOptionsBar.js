import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Menu, useTheme } from 'react-native-paper'
import { IconButton } from '@/components'
import { openImagePicker } from '@/utils'
import { BulletedList, Camera, CheckList, Lock, NumberedList, Picture, Unlock } from '@/icons'
import { FONTS } from '@/constants'

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
            style={[styles.container, {
                backgroundColor: colors.background
            }]}
        >
            <View style={styles.section}>
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
                        titleStyle={styles.title}
                        onPress={() => onListType('bulleted')}
                        leadingIcon={() => <BulletedList {...iconProps} />}
                    />
                    <Menu.Item
                        title={t('list.numbered')}
                        titleStyle={styles.title}
                        onPress={() => onListType('numbered')}
                        leadingIcon={() => <NumberedList {...iconProps} />}
                    />
                    <Menu.Item
                        title={t('list.checklist')}
                        titleStyle={styles.title}
                        onPress={() => onListType('checklist')}
                        leadingIcon={() => <CheckList {...iconProps} />}
                    />
                </Menu>
            </View>

            <View style={styles.section}>
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

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    section: {
        flexDirection: 'row',
        gap: 8
    },
    title: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
