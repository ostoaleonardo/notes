import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { ListMenu, ReminderMenu } from '../Menus'
import { IconButton } from '@/components'
import { Camera, Lock, Notifications, Picture, Unlock } from '@/icons'
import { openImagePicker } from '@/utils'
import { FONTS } from '@/constants'

export function BottomOptionsBar({ onAddImage, onListType, reminder, password }) {
    const { colors } = useTheme()
    const iconProps = { color: colors.onBackground }

    const [listVisible, setListVisible] = useState(false)
    const [reminderVisible, setReminderVisible] = useState(false)

    const {
        hasReminder,
        onOpenReminder,
        onDeleteReminder
    } = reminder

    const {
        hasPassword,
        onOpenPassword
    } = password

    const handleImagePicker = async (type) => {
        const assets = await openImagePicker(type)
        if (assets) onAddImage(assets)
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

                <ListMenu
                    visible={listVisible}
                    setVisible={setListVisible}
                    onListType={onListType}
                    iconProps={iconProps}
                />

                {hasReminder ? (
                    <ReminderMenu
                        visible={reminderVisible}
                        setVisible={setReminderVisible}
                        onOpenReminder={onOpenReminder}
                        onDelete={onDeleteReminder}
                        iconProps={iconProps}
                    />
                ) : (
                    <IconButton
                        variant='light'
                        onPress={onOpenReminder}
                        icon={<Notifications {...iconProps} />}
                    />
                )}
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
