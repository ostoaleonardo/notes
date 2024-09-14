import { StyleSheet } from 'react-native'
import { Menu } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { MenuContainer } from './MenuContainer'
import { IconButton } from '@/components'
import { BulletedList, CheckList, NumberedList } from '@/icons'
import { FONTS } from '@/constants'

export function ListMenu({ visible, setVisible, onListType, iconProps }) {
    const { t } = useTranslation()

    const onOpen = () => setVisible(true)
    const onClose = () => setVisible(false)

    return (
        <MenuContainer
            visible={visible}
            onClose={onClose}
            anchor={
                <IconButton
                    variant='light'
                    onPress={onOpen}
                    icon={<CheckList {...iconProps} />}
                />
            }
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
