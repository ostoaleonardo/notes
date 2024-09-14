import { Menu, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { MenuContainer } from './MenuContainer'
import { Button } from '@/components'

export function RepeatMenu({ visible, setVisible, repeat, setRepeat }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const onOpen = () => setVisible(true)
    const onClose = () => setVisible(false)

    const handleRepeat = (value) => {
        setRepeat(value)
        onClose()
    }

    return (
        <MenuContainer
            visible={visible}
            onClose={onClose}
            anchor={
                <Button
                    autoWidth
                    variant='light'
                    onPress={onOpen}
                    label={t('reminder.' + repeat)}
                />
            }
            contentStyle={{
                backgroundColor: colors.background
            }}
        >
            <Menu.Item
                title={t('reminder.never')}
                onPress={() => handleRepeat('never')}
            />
            <Menu.Item
                title={t('reminder.daily')}
                onPress={() => handleRepeat('daily')}
            />
            <Menu.Item
                title={t('reminder.weekly')}
                onPress={() => handleRepeat('weekly')}
            />
            <Menu.Item
                title={t('reminder.monthly')}
                onPress={() => handleRepeat('monthly')}
            />
            <Menu.Item
                title={t('reminder.yearly')}
                onPress={() => handleRepeat('yearly')}
            />
        </MenuContainer>
    )
}