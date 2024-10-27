import { useState } from 'react'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { SortMenu } from '@/components'
import { Sort } from '@/icons'

export function SortAction() {
    const { colors } = useTheme()
    const { t } = useTranslation()
    const [visible, setVisible] = useState(false)

    const onOpenMenu = () => setVisible(true)
    const onCloseMenu = () => setVisible(false)

    return (
        <SortMenu
            visible={visible}
            onClose={onCloseMenu}
            anchor={
                <Tooltip title={t('header.sort')}>
                    <Appbar.Action
                        animated={false}
                        onPress={onOpenMenu}
                        icon={() => <Sort color={colors.onBackground} />}
                    />
                </Tooltip>
            }
        />
    )
}
