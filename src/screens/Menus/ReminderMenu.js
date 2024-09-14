import { StyleSheet } from 'react-native'
import { Menu } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { MenuContainer } from './MenuContainer'
import { IconButton } from '@/components'
import { Delete, Edit, NotificationsActive } from '@/icons'
import { FONTS } from '@/constants'

export function ReminderMenu({ visible, setVisible, onOpenReminder, onDelete, iconProps }) {
    const { t } = useTranslation()

    const onOpen = () => setVisible(true)
    const onClose = () => setVisible(false)

    const onOpenModal = () => {
        onClose()
        onOpenReminder()
    }

    return (
        <MenuContainer
            visible={visible}
            onClose={onClose}
            anchor={
                <IconButton
                    variant='light'
                    onPress={onOpen}
                    icon={<NotificationsActive {...iconProps} />}
                />
            }
        >
            <Menu.Item
                title={t('reminder.edit')}
                titleStyle={styles.title}
                onPress={onOpenModal}
                leadingIcon={() => <Edit {...iconProps} />}
            />
            <Menu.Item
                title={t('reminder.delete')}
                titleStyle={styles.title}
                onPress={onDelete}
                leadingIcon={() => <Delete {...iconProps} />}
            />
        </MenuContainer>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
