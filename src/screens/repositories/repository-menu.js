import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'
import { MenuContainer, MenuItem } from '@/components'
import { Close, Delete, Edit, MoreVert } from '@/icons'

export function RepositoryMenu({ onRename, onForget, onDelete }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

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
                        icon={(props) => <MoreVert {...props} />}
                        onPress={() => setVisible(true)}
                        accessibilityLabel={t('button.more')}
                    />
                </Tooltip>
            }
        >
            <MenuItem
                title={t('repositories.rename')}
                leadingIcon={(props) => <Edit {...props} />}
                onPress={() => runAction(onRename)}
            />
            <MenuItem
                title={t('repositories.forget')}
                leadingIcon={(props) => <Close {...props} />}
                onPress={() => runAction(onForget)}
            />
            <MenuItem
                title={t('repositories.delete')}
                leadingIcon={(props) => <Delete {...props} color={colors.error} />}
                onPress={() => runAction(onDelete)}
            />
        </MenuContainer>
    )
}
