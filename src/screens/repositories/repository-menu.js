import { useState } from 'react'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { MenuContainer, MenuItem } from '@/components'
import { Close, Delete, Edit, MoreVert } from '@/icons'
import { useIconProps } from '@/hooks'

export function RepositoryMenu({ onRename, onForget, onDelete }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const iconProps = useIconProps(16)
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
                    <IconButton
                        onPress={() => setVisible(true)}
                        icon={() => <MoreVert {...iconProps} />}
                    />
                </Tooltip>
            }
        >
            <MenuItem
                title={t('repositories.rename')}
                leadingIcon={() => <Edit {...iconProps} />}
                onPress={() => runAction(onRename)}
            />
            <MenuItem
                title={t('repositories.forget')}
                leadingIcon={() => <Close {...iconProps} />}
                onPress={() => runAction(onForget)}
            />
            <MenuItem
                title={t('repositories.delete')}
                leadingIcon={() => <Delete {...iconProps} color={colors.error} />}
                onPress={() => runAction(onDelete)}
            />
        </MenuContainer>
    )
}
