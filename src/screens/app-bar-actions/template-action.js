import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Appbar, Divider, Tooltip } from 'react-native-paper'
import { MenuContainer, MenuItem } from '@/components'
import { useIconProps } from '@/hooks'
import { Code, Delete, MoreVert } from '@/icons'

export function TemplateAction({ onOpenPlaceholders, onDelete }) {
    const iconProps = useIconProps()
    const { t } = useTranslation()

    const [visible, setVisible] = useState(false)

    const runAction = (action) => {
        setVisible(false)
        action()
    }

    return (
        <MenuContainer
            visible={visible}
            onClose={() => setVisible(false)}
            anchor={
                <Tooltip title={t('button.more')}>
                    <Appbar.Action
                        animated={false}
                        onPress={() => setVisible(true)}
                        icon={() => <MoreVert {...iconProps} />}
                    />
                </Tooltip>
            }
        >
            <MenuItem
                title={t('templates.view_placeholders')}
                leadingIcon={() => <Code {...iconProps} />}
                onPress={() => runAction(onOpenPlaceholders)}
            />

            <Divider />

            <MenuItem
                title={t('button.delete')}
                leadingIcon={() => <Delete {...iconProps} />}
                onPress={() => runAction(onDelete)}
            />
        </MenuContainer>
    )
}
