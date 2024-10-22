import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton, useTheme } from 'react-native-paper'
import { MenuContainer } from './MenuContainer'
import { MenuItem } from './MenuItem'
import { BulletedList, CheckList, NumberedList } from '@/icons'

export function ListMenu({ onListType }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const [visible, setVisible] = useState(false)

    const onOpenMenu = () => setVisible(true)
    const onCloseMenu = () => setVisible(false)

    const iconProps = {
        color: colors.onBackground
    }

    return (
        <MenuContainer
            visible={visible}
            onClose={onCloseMenu}
            anchor={
                <IconButton
                    onPress={onOpenMenu}
                    icon={() => <CheckList {...iconProps} />}
                />
            }
        >
            <MenuItem
                title={t('list.bulleted')}
                onPress={() => onListType('bulleted')}
                leadingIcon={() => <BulletedList {...iconProps} />}
            />
            <MenuItem
                title={t('list.numbered')}
                onPress={() => onListType('numbered')}
                leadingIcon={() => <NumberedList {...iconProps} />}
            />
            <MenuItem
                title={t('list.checklist')}
                onPress={() => onListType('checklist')}
                leadingIcon={() => <CheckList {...iconProps} />}
            />
        </MenuContainer>
    )
}
